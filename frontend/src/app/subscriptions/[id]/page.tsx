"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useSubscription, useRenewSubscription, useDeleteSubscription } from "@/hooks/api/useSubscriptions"
import { useRazorpay } from "@/hooks/api/useRazorpay"
import { format } from "date-fns"

export default function SubscriptionDetailsPage() {
  const params = useParams()
  const subscriptionId = params.id as string

  const { data: subscription, isLoading, refetch } = useSubscription(subscriptionId)
  const renewSubscription = useRenewSubscription()
  const cancelSubscription = useDeleteSubscription()
  const razorpay = useRazorpay()

  const handleRenew = async () => {
    try {
      await renewSubscription.mutateAsync(subscriptionId)
    } catch (error) {
      console.error("Failed to renew:", error)
    }
  }

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this subscription?")) {
      try {
        await cancelSubscription.mutateAsync(subscriptionId)
      } catch (error) {
        console.error("Failed to cancel:", error)
      }
    }
  }

  const handlePay = async () => {
    try {
      const res = await razorpay.loadRazorpayScript()
      if (!res) {
        alert("Failed to load Razorpay SDK. Are you online?")
        return
      }

      const orderData = await razorpay.createOrder(subscriptionId)

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "GymOS",
        description: "Subscription Payment",
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            await razorpay.verifyPayment({
              subscriptionId: subscriptionId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            alert("Payment successful!")
            refetch()
          } catch (err) {
            alert("Payment verification failed")
          }
        },
        prefill: {
          name: subscription?.member?.firstName || "Member",
        },
        theme: {
          color: "#171717",
        },
      }

      const paymentObject = new (window as any).Razorpay(options)
      paymentObject.on("payment.failed", function (response: any) {
        alert("Payment Failed")
      })
      paymentObject.open()
    } catch (error) {
      console.error("Payment initiation failed", error)
      alert("Failed to initiate payment")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <span className="text-[var(--ash)] text-sm">Loading subscription details...</span>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-[var(--hairline-soft)] rounded-[6px] bg-[var(--canvas-light)]">
        <span className="text-[var(--ash)] text-sm mb-4">Subscription not found.</span>
        <Link href="/subscriptions">
          <Button variant="secondary">Back to Subscriptions</Button>
        </Link>
      </div>
    )
  }

  const memberName = subscription.member ? `${subscription.member.firstName} ${subscription.member.lastName}` : "Unknown Member"
  const planName = subscription.membershipPlan ? subscription.membershipPlan.name : "Unknown Plan"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/subscriptions" className="text-[var(--ash)] hover:text-[var(--on-primary)] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--on-primary)]">Subscription Details</h1>
            <p className="text-sm text-[var(--ash)]">{memberName} - {planName}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {subscription.status === "PENDING" && (
            <Button variant="primary" onClick={handlePay} disabled={razorpay.isLoading}>
              Pay Now
            </Button>
          )}
          {subscription.status !== "ACTIVE" && subscription.status !== "PENDING" && (
            <Button variant="secondary" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={handleRenew} disabled={renewSubscription.isPending}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Renew
            </Button>
          )}
          {subscription.status === "ACTIVE" && (
            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleCancel} disabled={cancelSubscription.isPending}>
              <XCircle className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--canvas-light)] p-6 rounded-[6px] border border-[var(--hairline-soft)] space-y-4">
          <h2 className="text-lg font-medium text-[var(--on-primary)] border-b border-[var(--hairline-soft)] pb-2">Member Information</h2>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Name</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">
                {subscription.member ? (
                  <Link href={`/members/${subscription.member.id}`} className="text-blue-600 hover:underline">
                    {memberName}
                  </Link>
                ) : (
                  memberName
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Member ID</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">{subscription.member?.memberCode || "-"}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--canvas-light)] p-6 rounded-[6px] border border-[var(--hairline-soft)] space-y-4">
          <h2 className="text-lg font-medium text-[var(--on-primary)] border-b border-[var(--hairline-soft)] pb-2">Plan Information</h2>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Plan</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">
                {subscription.membershipPlan ? (
                  <Link href={`/plans/${subscription.membershipPlan.id}`} className="text-blue-600 hover:underline">
                    {planName}
                  </Link>
                ) : (
                  planName
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Status</p>
              <div className="mt-1">
                {subscription.status === "ACTIVE" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-green-50 text-green-700 border border-green-200 text-[12px]">
                    Active
                  </span>
                )}
                {subscription.status === "EXPIRED" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-red-50 text-red-700 border border-red-200 text-[12px]">
                    Expired
                  </span>
                )}
                {subscription.status === "CANCELLED" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-[var(--canvas-paper)] text-[var(--ink-soft)] border border-[var(--hairline)] text-[12px]">
                    Cancelled
                  </span>
                )}
                {subscription.status === "PENDING" && (
                  <span className="inline-flex items-center px-2 py-1 rounded-[100px] bg-yellow-50 text-yellow-700 border border-yellow-200 text-[12px]">
                    Pending
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Start Date</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">{format(new Date(subscription.startDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">End Date</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">{format(new Date(subscription.endDate), "MMM d, yyyy")}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Amount</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">₹{Number(subscription.amount).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--ash)] uppercase tracking-wider font-mono">Auto Renew</p>
              <p className="text-sm text-[var(--on-primary)] font-medium mt-1">{subscription.autoRenew ? "Yes" : "No"}</p>
            </div>
          </div>
        </div>

        <div className="bg-[var(--canvas-light)] p-6 rounded-[6px] border border-[var(--hairline-soft)] md:col-span-2 space-y-4">
          <h2 className="text-lg font-medium text-[var(--on-primary)] border-b border-[var(--hairline-soft)] pb-2">Notes</h2>
          <p className="text-sm text-[var(--on-primary)] whitespace-pre-wrap">
            {subscription.notes || "No notes provided."}
          </p>
        </div>
      </div>
    </div>
  )
}
