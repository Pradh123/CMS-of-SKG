import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Printer, QrCode } from 'lucide-react'
import PageHeader from '../../components/layout/PageHeader.jsx'
import { STORAGE_PREFIX } from '../../config/constants.js'
import useCrudRecords from '../../hooks/useCrudRecords.js'
import { formatPlainValue } from '../../components/crm/crmShared.jsx'
import { invoiceConfig } from './data/invoiceConfig.js'

const SETTINGS_KEY = `${STORAGE_PREFIX}invoice-settings`

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

function money(value) {
  return formatPlainValue(value || 0, 'currency')
}

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-slate-700">{children || '—'}</dd>
    </div>
  )
}

export default function InvoiceDocumentPage() {
  const { id } = useParams()
  const { records } = useCrudRecords(invoiceConfig)
  const invoice = records.find(item => String(item.id) === String(id))
  const settings = readSettings()

  if (!invoice) {
    return (
      <div className="mx-auto w-full max-w-6xl pb-8">
        <PageHeader
          title="Invoice not found"
          description="It may have been removed or the link may be incorrect."
          action={
            <Link
              to="/invoices"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm"
            >
              <ArrowLeft size={16} /> Back to invoices
            </Link>
          }
        />
      </div>
    )
  }

  const extraKmAmount = Number(invoice.extraKmDriven || 0) * Number(invoice.extraKmRate || 0)
  const paymentConfigured = Boolean(
    settings.bankName || settings.accountName || settings.accountNumber || settings.upiId
  )

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <div className="invoice-screen-header">
        <PageHeader
          title={`Invoice ${invoice.invoiceNumber}`}
          description="Review, edit, or print this customer invoice."
          action={
            <div className="flex flex-wrap gap-2">
              <Link
                to="/invoices"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
              >
                <ArrowLeft size={16} /> Back
              </Link>
              <Link
                to={`/invoices/${invoice.id}/edit`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
              >
                <Pencil size={16} /> Edit
              </Link>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:brightness-105"
              >
                <Printer size={16} /> Print invoice
              </button>
            </div>
          }
        />
      </div>

      <article className="invoice-print-page overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,45,75,0.08)]">
        <header className="flex flex-col gap-7 border-b border-slate-200 bg-gradient-to-br from-white via-white to-sky-50 px-6 py-7 sm:flex-row sm:items-start sm:justify-between sm:px-9 sm:py-9">
          <div className="flex items-center gap-4">
            <img className="h-16 w-16 object-contain" src="/logo/skg-logo.png" alt="SKG Travels" />
            <div>
              <p className="text-xl font-extrabold tracking-tight text-slate-900">SKG TRAVELS</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-sky-700">
                Travel & fleet services
              </p>
            </div>
          </div>
          <div className="sm:text-right">
            <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700">
              Tax invoice
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {invoice.invoiceNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{formatPlainValue(invoice.date, 'date')}</p>
          </div>
        </header>

        <section className="grid gap-7 border-b border-slate-200 px-6 py-7 sm:grid-cols-2 sm:px-9">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-700">
              Bill to
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">{invoice.clientName}</h2>
            <p className="mt-2 max-w-md whitespace-pre-wrap text-sm leading-6 text-slate-500">
              {invoice.clientAddress || 'No billing address saved.'}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-5 gap-y-4 rounded-2xl bg-slate-50 p-5">
            <Detail label="Customer ID">{invoice.customerId}</Detail>
            <Detail label="Vehicle">{invoice.vehicleNumber}</Detail>
            <Detail label="Invoice date">{formatPlainValue(invoice.date, 'date')}</Detail>
            <Detail label="Status">Issued</Detail>
          </dl>
        </section>

        <section className="px-6 py-7 sm:px-9">
          <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">
            Service details
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Service</th>
                  <th className="px-5 py-3.5 text-right">Quantity</th>
                  <th className="px-5 py-3.5 text-right">Rate</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-200 text-sm text-slate-600">
                  <td className="px-5 py-5 font-semibold text-slate-800">{invoice.serviceName}</td>
                  <td className="px-5 py-5 text-right">{invoice.serviceQuantity || 0}</td>
                  <td className="px-5 py-5 text-right">{money(invoice.serviceRate)}</td>
                  <td className="px-5 py-5 text-right font-bold text-slate-900">
                    {money(invoice.serviceAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-7 border-t border-slate-200 bg-slate-50/55 px-6 py-7 sm:grid-cols-[1fr_340px] sm:px-9">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">
              Payment details
            </h2>
            {paymentConfigured ? (
              <div className="mt-4 flex items-start gap-5">
                <dl className="grid flex-1 grid-cols-2 gap-x-5 gap-y-4">
                  <Detail label="Bank">{settings.bankName}</Detail>
                  <Detail label="Account name">{settings.accountName}</Detail>
                  <Detail label="Account number">{settings.accountNumber}</Detail>
                  <Detail label="IFSC code">{settings.ifscCode}</Detail>
                  <Detail label="Branch">{settings.branchName}</Detail>
                  <Detail label="UPI ID">{settings.upiId}</Detail>
                </dl>
                {settings.qrImage && (
                  <img
                    className="h-24 w-24 shrink-0 rounded-xl border border-slate-200 bg-white object-contain p-1"
                    src={settings.qrImage}
                    alt="Payment QR code"
                  />
                )}
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                <QrCode className="mt-0.5 shrink-0 text-sky-600" size={18} />
                <p>
                  Payment information has not been configured. Add it under Invoice Settings to
                  include bank and UPI details here.
                </p>
              </div>
            )}
          </div>

          <dl className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
            <div className="flex justify-between gap-4 text-slate-500">
              <dt>Service amount</dt>
              <dd className="font-semibold text-slate-700">{money(invoice.serviceAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-slate-500">
              <dt>Driver DA</dt>
              <dd className="font-semibold text-slate-700">{money(invoice.driverDa)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-slate-500">
              <dt>Extra km ({invoice.extraKmDriven || 0})</dt>
              <dd className="font-semibold text-slate-700">{money(extraKmAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-slate-500">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-slate-700">{money(invoice.subTotalAmount)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-slate-500">
              <dt>GST ({invoice.gst || 0}%)</dt>
              <dd className="font-semibold text-slate-700">
                {money(Number(invoice.totalAmount || 0) - Number(invoice.subTotalAmount || 0))}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-t-2 border-slate-800 pt-4">
              <dt className="font-bold text-slate-900">Total</dt>
              <dd className="text-xl font-extrabold text-sky-700">{money(invoice.totalAmount)}</dd>
            </div>
          </dl>
        </section>

        <footer className="border-t border-slate-200 px-6 py-5 text-center text-xs leading-5 text-slate-400 sm:px-9">
          Thank you for choosing SKG Travels. This invoice was generated from the SKG Admin
          workspace.
        </footer>
      </article>
    </div>
  )
}
