<?php

namespace App\Http\Controllers\Api;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Support\ApiResponse;

class AiController extends ApiController
{
    /**
     * POST /api/ai/chat
     *
     * Payload:
     *  {
     *    message:   string,
     *    locale:    "ar" | "en",
     *    context?:  { page: string, shipment_id?: number, user_role: string },
     *    history?:  [{ role: "user"|"assistant", content: string }]
     *  }
     */
    public function chat(Request $request)
    {
        $request->validate([
            'message'              => 'required|string|max:500',
            'locale'               => 'required|in:ar,en',
            'context'              => 'nullable|array',
            'context.page'         => 'nullable|string',
            'context.shipment_id'  => 'nullable|integer',
            'context.user_role'    => 'nullable|string',
            'history'              => 'nullable|array',
            'history.*.role'       => 'required_with:history|in:user,assistant',
            'history.*.content'    => 'required_with:history|string',
        ]);

        $user    = $request->user();
        $locale  = $request->input('locale');
        $message = trim($request->input('message'));
        $context = $request->input('context', []);
        $history = array_slice($request->input('history', []), -5); // last 5 messages

        // ── 1. Fetch real shipment context if shipment_id is provided ──────────
        $shipmentContext = null;
        if (!empty($context['shipment_id'])) {
            try {
                $shipment = Shipment::with(['events' => function ($q) {
                    $q->latest()->limit(1);
                }])
                    ->where('id', $context['shipment_id'])
                    ->first();

                if ($shipment && ($user->role !== 'customer' || $shipment->customer_id === $user->id)) {
                    $lastEvent = $shipment->events->first();
                    $shipmentContext = [
                        'shipment_id'   => $shipment->id,
                        'status'        => $shipment->status,
                        'current_stage' => $this->humanizeStatus($shipment->status, $locale),
                        'origin'        => $shipment->origin,
                        'destination'   => $shipment->destination,
                        'mode'          => $shipment->mode,
                        'last_event'    => $lastEvent ? $lastEvent->description : null,
                        'pickup_date'   => $shipment->pickup_date,
                    ];
                }
            } catch (\Exception $e) {
                // Non-fatal — proceed without shipment context
            }
        }

        // ── 2. Build system prompt ─────────────────────────────────────────────
        $systemPrompt = $this->buildSystemPrompt($locale, $user->role, $shipmentContext, $context);

        // ── 3. Try OpenAI, fall back to smart static if no key ────────────────
        $apiKey = config('services.openai.key');

        if ($apiKey) {
            $reply = $this->callOpenAI($apiKey, $systemPrompt, $history, $message, $locale);
        } else {
            $reply = $this->smartFallback($message, $locale, $user->role, $shipmentContext);
        }

        return ApiResponse::ok([
            'reply'  => $reply,
            'locale' => $locale,
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function buildSystemPrompt(string $locale, string $role, ?array $shipmentCtx, array $ctx): string
    {
        $isAr = $locale === 'ar';

        $roleInstructions = [
            'customer' => $isAr
                ? 'المستخدم: عميل. يقوم بإنشاء الشحنات، تتبعها، رفع المستندات، اختيار عروض الشركاء، ودفع الفواتير.'
                : 'The user is a Customer. They create shipments, track them, select offers, upload documents, and pay invoices.',
            'partner' => $isAr
                ? 'المستخدم: شريك/ناقل. يقوم بتقديم عروض الأسعار (Quotes)، تحديث حالات الشحنات، ورفع الإثباتات (POD).'
                : 'The user is a Partner/Carrier. They submit quotes, update shipment status, and upload proofs (POD).',
            'ops' => $isAr
                ? 'المستخدم: عمليات/مدير. يقوم بالاعتماد للموافقة على الشحنات وتعيين الشركاء وإدارة النظام والمشكلات.'
                : 'The user is Ops/Admin. They approve shipments, assign partners, and manage the system operations.',
            'admin' => $isAr
                ? 'المستخدم: عمليات/مدير. يقوم بالاعتماد للموافقة على الشحنات وتعيين الشركاء وإدارة النظام والمشكلات.'
                : 'The user is Ops/Admin. They approve shipments, assign partners, and manage the system operations.',
        ];

        $roleNote = $roleInstructions[$role] ?? ($isAr ? 'مستخدم عام للمنصة.' : 'General platform user.');

        $baseAr = <<<PROMPT
أنت مساعد ShipNovo الذكي - مساعد لوجستي تشغيلي متكامل داخل منصة 4PL.

**معاملك (YOUR ROLE):**
يجب أن تفهم أي سؤال يطرحه المستخدم (ليست أسئلة مسبقة الإعداد فقط) وتجيب بناءً على خبرتك في المنصة كخبير لوجستي ومرشد ذكي للنظام، وليس مجرد بوت أسئلة شائعة.
يجب عليك توضيح، إرشاد، تحليل، واقتراح الخطوات التالية بناءً على السياق، بلهجة احترافية ومفيدة.

**دور المستخدم الحالي:**
{$roleNote}

**معرفتك بالمنصة (PLATFORM KNOWLEDGE):**
منصة ShipNovo تدير دورة حياة الشحنات وتشمل الأجزاء التالية بشكل كامل:
1) طلبات التسعير (RFQ).
2) عروض الشركاء (Offers).
3) اختيار العميل للعرض وتأكيده (Offer Selection).
4) موافقة فريق العمليات (Admin/Ops Approval) وإنشاء أمر عمل (Work Order).
5) تنفيذ الشحنة: (الاستلام -> النقل -> التسليم) (Pickup -> Transit -> Delivery).
6) التتبع الزمني والأحداث.
7) المستندات (رفع/تحميل).
8) الفواتير وحالات الدفع.
9) التذاكر ومحادثات الدعم (Tickets).
10) باقات التسعير والتكاليف.

**قواعد الإجابة:**
1. افهم الهدف (حتى لو كان السؤال غير واضح).
2. استخدم منطق النظام الفعلي في إجابتك.
3. كن واضحاً ومفيداً، والمقترح دائماً خطوة تالية قابلة للتنفيذ.
4. أجب دائماً باللغة العربية الفصحى. لا تعطِ إجابات عامة مثل "يمكنك سؤالي عن..."، بل قدّم حلاً حقيقياً.
PROMPT;

        $baseEn = <<<PROMPT
You are ShipNovo AI - a deeply integrated operational assistant for a 4PL logistics platform.

**YOUR ROLE:**
You are NOT a simple chatbot or FAQ bot. You are a logistics expert and system guide.
Understand ANY user question and answer using platform knowledge.
You must explain, guide, analyze, and suggest next actions based on context, in a clear, professional SaaS tone.

**CURRENT USER ROLE:**
{$roleNote}

**PLATFORM KNOWLEDGE:**
ShipNovo is a 4PL platform with the following lifecycle:
1) RFQ (Request for Quote).
2) Offers from partners.
3) Offer selection by customer.
4) Ops approval + Work Order.
5) Shipment execution (pickup -> transit -> delivery).
6) Timeline tracking (events + ETA).
7) Documents (upload/download).
8) Invoices (payment & status).
9) Tickets / Conversations.
10) Pricing packages.

**RESPONSE RULES:**
1. Understand the intent (even vague questions).
2. Use real system logic to answer.
3. Keep the response clear, helpful, and action-oriented. Suggest the next step.
4. Always answer in English. Do NOT use generic fallback answers like "You can ask me about...". Give a REAL answer.
PROMPT;

        $base = $isAr ? $baseAr : $baseEn;

        // Inject shipment context if available
        if ($shipmentCtx) {
            $ctxBlock = json_encode($shipmentCtx, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            if ($isAr) {
                $base .= "\n\n=== بيانات الشحنة الحالية (السياق الحالي) ===\n{$ctxBlock}\n\nاستخدم هذه البيانات للرد بشكل دقيق ومحدد على تساؤل المستخدم.";
            } else {
                $base .= "\n\n=== CURRENT SHIPMENT DATA (CONTEXT) ===\n{$ctxBlock}\n\nUse this data to give accurate, specific answers to the user's query.";
            }
        }

        // Inject page context
        if (!empty($ctx['page'])) {
            if ($isAr) {
                $base .= "\n\nالمستخدم حالياً متواجد في صفحة: {$ctx['page']}";
            } else {
                $base .= "\n\nUser is currently on page: {$ctx['page']}";
            }
        }

        return $base;
    }

    private function callOpenAI(string $apiKey, string $systemPrompt, array $history, string $message, string $locale): string
    {
        $messages = [['role' => 'system', 'content' => $systemPrompt]];

        foreach ($history as $h) {
            $messages[] = ['role' => $h['role'], 'content' => $h['content']];
        }
        $messages[] = ['role' => 'user', 'content' => $message];

        try {
            $response = Http::withToken($apiKey)
                ->timeout(20)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model'       => 'gpt-4o-mini',
                    'messages'    => $messages,
                    'max_tokens'  => 400,
                    'temperature' => 0.7,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content', '');
            }

            // Log error but fall through to fallback
            \Illuminate\Support\Facades\Log::warning('OpenAI API error', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('OpenAI exception: ' . $e->getMessage());
        }

        return $this->smartFallback($message, $locale, '', null);
    }

    private function smartFallback(string $message, string $locale, string $role, ?array $shipCtx): string
    {
        $isAr = $locale === 'ar';
        $msg  = mb_strtolower($message);

        // Shipment-specific context response
        if ($shipCtx) {
            $status = $shipCtx['status'] ?? '';
            $stage  = $shipCtx['current_stage'] ?? '';
            $origin = $shipCtx['origin'] ?? '';
            $dest   = $shipCtx['destination'] ?? '';
            $last   = $shipCtx['last_event'] ?? '';

            if (str_contains($msg, 'late') || str_contains($msg, 'تأخير') || str_contains($msg, 'متأخر')) {
                if ($isAr) {
                    return "بناءً على معلومات النظام لشحنتك الحالية، هي الآن في مرحلة **{$stage}**. إذا كان هناك تأخير غير متوقع في التحديثات، أنصحك بفتح تذكرة دعم أو التحقق من قسم التتبع في صفحة الشحنة لتسريع المشكلة مع فريق العمليات.";
                } else {
                    return "Based on system data, your shipment is currently in the **{$stage}** stage. If there is an unexpected delay, I suggest you check the timeline on the shipment page or open a support Ticket so our Ops team can expedite delivery.";
                }
            }

            if ($isAr) {
                $reply = "شحنتك الآن في مرحلة **{$stage}**";
                if ($origin && $dest) $reply .= " من {$origin} إلى {$dest}";
                if ($last)   $reply .= ".\nأحدث حركة كانت: {$last}";
                return $reply . ".\n\nأنصحك بالانتقال إلى صفحة الشحنة وتتبع الجدول الزمني لمعرفة موعد وتحديثات الوصول.";
            } else {
                $reply = "Your shipment is currently **{$stage}**";
                if ($origin && $dest) $reply .= " from {$origin} to {$dest}";
                if ($last)   $reply .= ".\nThe latest movement was: {$last}";
                return $reply . ".\n\nI recommend going to the shipment page and tracking the timeline to stay up-to-date with the ETA.";
            }
        }

        // Keyword-based smart responses
        $keywords = [
            'late'       => ['متأخر', 'تأخير', 'late', 'delay'],
            'start'      => ['أبدأ', 'بداية', 'انشاء', 'create', 'start', 'how to ship'],
            'package'    => ['باكجات', 'باقة', 'خطة', 'package', 'tier', 'plan', 'فرق'],
            'invoice'    => ['فاتورة', 'invoice', 'دفع', 'pay'],
            'shipment'   => ['شحن', 'شحنة', 'شحنات', 'shipment', 'freight'],
            'track'      => ['تتبع', 'tracking', 'track', 'وين', 'where'],
            'price'      => ['سعر', 'تسعير', 'pricing', 'price', 'cost', 'تكلفة'],
            'document'   => ['مستند', 'وثيقة', 'document', 'doc', 'ملف'],
        ];

        foreach ($keywords as $type => $kws) {
            foreach ($kws as $kw) {
                if (str_contains($msg, $kw)) {
                    return $this->keywordResponse($type, $isAr, $role);
                }
            }
        }

        // Real default answer, not generic FAQ style
        if ($isAr) {
            return "من خلال دورك في المنصة كـ " . ($role === 'customer' ? 'عميل' : ($role === 'partner' ? 'شريك ناقل' : 'عمليات')) . "، يمكنني توجيهك في إدارة الشحنات، عروض الأسعار، والمستندات. يُرجى الانتقال إلى القسم المختص أو توضيح سؤالك لتزويدك بمعلومات دقيقة من النظام.";
        }
        return "Given your system role as a " . ucfirst($role) . ", I can guide you through managing shipments, quotes, invoices, and compliance documents. Please specify your query or navigate to the relevant module so I can provide precise operational assistance.";
    }

    private function keywordResponse(string $type, bool $isAr, string $role): string
    {
        $responses = [
            'late' => [
                'ar' => "تأخير الشحنات قد ينتج عن تواجد بضائع في الموانئ أو تأخر بالإجراءات الجمركية. بصفتك مستخدم للمنصة، يُرجى مراجعة صفحة 'التتبع' في تفاصيل شحنتك لمعرفة مكان التأخير. يمكنك فتح تذكرة دعم لفريق العمليات للتدخل المباشر.",
                'en' => "Shipment delays are often due to port congestion or customs. Please check the 'Tracking' timeline inside your shipment to pinpoint the hold-up. You can open an Ops Ticket for direct intervention if needed.",
            ],
            'start' => [
                'ar' => "للبدء بإنشاء شحنة، اذهب إلى قائمة الشحنات واضغط على زر 'شحنة جديدة'. قم بتعبئة نموذج نقطة الانطلاق والوصول وتفاصيل الحمولة. بعدها سيعمل نظامنا الذكي على جلب عروض أسعار (Quotes) من شبكة الشركات لتختار الأنسب.",
                'en' => "To start a shipment, navigate to Shipments and click 'New Shipment'. Provide the required origin, destination, and cargo details. Our smart orchestration engine will then fetch Quotes from our partners so you can select the best rate.",
            ],
            'package' => [
                'ar' => "باقات منصتنا مهيأة حسب حجم عملياتك اللوجستية:\n- **الأساسية**: للأعمال الصغيرة والمتوسطة (شحنات محدودة).\n- **الاحترافية**: للمستوردين بحجم أعلى مع دعم وتتبع متقدم.\n- **للمؤسسات**: شحنات غير محدودة وإدارة كاملة للمنظومة.\nيدرج على ذلك رسوم بسيطة لكل مرحلة توصيل. راجع قسم التسعير للمقارنة.",
                'en' => "Our pricing packages are geared towards your logistics volume:\n- **Basic**: For SMBs and limited shipments.\n- **Professional**: Higher volume importers with advanced tracking.\n- **Enterprise**: Unlimited operational scale and dedicated management.\nSmall dispatch fees apply per leg. Check the Pricing page to find your best fit.",
            ],
            'shipment' => [
                'ar' => "عند إنشاء شحنة وتحديد مسارها والتفاصيل الطرود، تبدأ دورة عمل الشحنة حيث يقدم الشركاء العروض ويتم الاعتماد. يمكنك متابعة دورة حياتها بالكامل ومستنداتها من صفحة الشحنات الخاصة بك.",
                'en' => "When a shipment is created with its route and parcel info, the lifecycle starts. Partners submit offers and Work Orders are generated. You can orchestrate and monitor everything directly from your Shipments hub.",
            ],
            'track' => [
                'ar' => "كل شحنة تمتلك جدولاً زمنياً يوضح حالتها ابتداءً من الاستلام وحتى التسليم النهائي. يمكنك الدخول إلى شحنتك والضغط على التتبع لرؤية الأحداث اللحظية ومعرفة التواريخ المتوقعة (ETA).",
                'en' => "Every shipment utilizes an event timeline from Pickup through Delivery. Simply access your shipment details and tap Tracking to observe real-time movement reports and the Estimated Time of Arrival (ETA).",
            ],
            'price' => [
                'ar' => "يتحدد سعر الشحن بناءً على العروض المقدمة من شركائنا الموثوقين وقت الطلب (RFQ). لمراجعة تكلفة النظام، توجه لصفحة 'التسعير' للتحقق من المزايا المتاحة في خطتك.",
                'en' => "Freight pricing is fundamentally dynamic, driven by Partner quotes from your RFQs. To view the fixed SaaS platform costs, please refer to the 'Pricing' dashboard to check your current subscription tier.",
            ],
            'document' => [
                'ar' => "خزنة المستندات بالمشروع تحتفظ مركزياً ببوالص الشحن الجوية والبحرية، بيانات الجمارك وفواتيرك. يمكنك الوصول إليها لرفع النواقص أو تحميل الإثباتات التي يعتمدها الشركاء.",
                'en' => "Our Document Vault acts as the central compliance repository for Bills of Lading, Customs entries, and commercial invoices. You can access it anytime to upload pending paperwork or download Proof of Delivery uploaded by carriers.",
            ],
            'invoice' => [
                'ar' => "فواتيرك تصدر مع مراحل تنفيذ الشحنات. انتقل فوراً إلى وحدة الفواتير في القائمة لمراجعة ما عليك سداده (Payment Status). النظام يقوم بتعليق الشحنة أحياناً في حال التأخر بالدفع لتفادي غرامات الشركاء.",
                'en' => "Invoices are logically generated across shipment execution phases. Head to the 'Invoices' module to verify pending totals and pay via trusted gateways. Delays here can pause ops to avoid partner penalty fees.",
            ],
            'help' => [
                'ar' => "أنا هنا لأعمل كمساعد عمليات (Ops) الخاص بك، يمكنني إرشادك حول التخليص الجمركي، تنسيق المستودعات ودورة التتبع. هل تواجه مشكلة معينة في شحنتك لأوجهك للشاشة المطلوبة؟",
                'en' => "I am operating as your digital Ops assistant. I'm capable of guiding you through Customs clearance, Warehousing orchestrations, and tracking. Are you facing an issue with a particular shipment so I can point you correctly?",
            ],
        ];

        $resp = $responses[$type] ?? $responses['help'];
        return $isAr ? $resp['ar'] : $resp['en'];
    }

    private function humanizeStatus(string $status, string $locale): string
    {
        $map = [
            'rfq'             => ['en' => 'Awaiting Quotation',       'ar' => 'بانتظار التسعير'],
            'offers_received' => ['en' => 'Offers Received',          'ar' => 'عروض مستلمة'],
            'offer_selected'  => ['en' => 'Offer Selected',           'ar' => 'تم اختيار العرض'],
            'processing'      => ['en' => 'Processing',               'ar' => 'قيد المعالجة'],
            'transit'         => ['en' => 'In Transit',               'ar' => 'في الطريق'],
            'at_destination'  => ['en' => 'At Destination Port',      'ar' => 'في ميناء الوصول'],
            'delivered'       => ['en' => 'Delivered',                'ar' => 'تم التسليم'],
            'cancelled'       => ['en' => 'Cancelled',                'ar' => 'ملغي'],
            'closed'          => ['en' => 'Closed',                   'ar' => 'مغلق'],
        ];

        return $map[$status][$locale] ?? ucfirst($status);
    }
}
