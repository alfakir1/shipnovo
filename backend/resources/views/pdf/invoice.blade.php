<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoice->invoice_number ?? $invoice->id }}</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
        .header { border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
        .logo span { color: #ea580c; }
        .invoice-details { float: right; text-align: right; }
        .invoice-details h2 { margin: 0; color: #ea580c; font-size: 28px; text-transform: uppercase; }
        .row { width: 100%; clear: both; margin-bottom: 30px; }
        .col { float: left; width: 48%; }
        .col-right { float: right; width: 48%; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background-color: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #cbd5e1; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .totals-table { width: 50%; float: right; }
        .totals-table th { background: none; text-align: right; border-bottom: none; }
        .totals-table td { text-align: right; border-bottom: 1px solid #e2e8f0; }
        .grand-total { font-weight: bold; font-size: 18px; color: #ea580c; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .badge-paid { background-color: #dcfce7; color: #166534; }
        .badge-pending { background-color: #fef08a; color: #854d0e; }
        .footer { text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 50px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="invoice-details">
            <h2>Invoice</h2>
            <p><strong>Invoice #:</strong> {{ $invoice->invoice_number ?? $invoice->id }}<br>
            <strong>Date:</strong> {{ $invoice->created_at->format('M d, Y') }}<br>
            <strong>Due Date:</strong> {{ $invoice->due_date ? \Carbon\Carbon::parse($invoice->due_date)->format('M d, Y') : 'N/A' }}</p>
            <p><strong>Status:</strong> 
                @if($invoice->status === 'paid')
                    <span class="badge badge-paid">Paid</span>
                @else
                    <span class="badge badge-pending">Pending</span>
                @endif
            </p>
        </div>
        <div class="logo">Ship<span>Novo</span></div>
        <p>123 Logistics Way<br>
        Riyadh, Saudi Arabia<br>
        contact@shipnovo.com</p>
    </div>

    <div class="row">
        <div class="col">
            <h3>Billed To:</h3>
            <p>
                <strong>{{ $customer->name ?? 'Customer' }}</strong><br>
                {{ $customer->company_name ?? '' }}<br>
                {{ $customer->email ?? '' }}
            </p>
        </div>
        <div class="col-right">
            <h3>Shipment Details:</h3>
            <p>
                <strong>Tracking #:</strong> {{ $shipment->tracking_number ?? 'N/A' }}<br>
                <strong>Origin:</strong> {{ $shipment->origin ?? 'N/A' }}<br>
                <strong>Destination:</strong> {{ $shipment->destination ?? 'N/A' }}<br>
                <strong>Weight:</strong> {{ $shipment->total_weight ?? '0' }} {{ $shipment->weight_unit ?? 'kg' }}
            </p>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Service Type</th>
                <th>Mode</th>
                <th style="text-align: right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Freight charges for shipment {{ $shipment->tracking_number ?? '' }}</td>
                <td style="text-transform: capitalize">{{ $shipment->service_type ?? 'Standard' }}</td>
                <td style="text-transform: capitalize">{{ $shipment->mode ?? 'Various' }}</td>
                <td style="text-align: right">{{ number_format($invoice->amount, 2) }} {{ $invoice->currency ?? 'USD' }}</td>
            </tr>
        </tbody>
    </table>

    <div class="row">
        <table class="totals-table">
            <tr>
                <th>Subtotal:</th>
                <td>{{ number_format($invoice->amount, 2) }} {{ $invoice->currency ?? 'USD' }}</td>
            </tr>
            <tr>
                <th>Tax (0%):</th>
                <td>0.00 {{ $invoice->currency ?? 'USD' }}</td>
            </tr>
            <tr>
                <th>Total:</th>
                <td class="grand-total">{{ number_format($invoice->amount, 2) }} {{ $invoice->currency ?? 'USD' }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Thank you for choosing ShipNovo. For any inquiries, please contact support@shipnovo.com.</p>
    </div>
</body>
</html>
