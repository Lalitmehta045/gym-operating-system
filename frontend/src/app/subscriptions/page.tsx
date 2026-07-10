"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { SubscriptionTable } from "@/components/subscriptions/SubscriptionTable"
import { SubscriptionDashboardCards } from "@/components/subscriptions/SubscriptionDashboardCards"
import { useSubscriptions, useRenewSubscription, useDeleteSubscription } from "@/hooks/api/useSubscriptions"
import { useRazorpay } from "@/hooks/api/useRazorpay"
import { useAuth } from "@/hooks/useAuth"

export default function SubscriptionsPage() {
  const [page, setPage] = React.useState(1)
  const { user } = useAuth()
  const isTrainer = user?.role === "TRAINER"
  const { data, isLoading, refetch } = useSubscriptions({ page })
  const renewSubscription = useRenewSubscription()
  const cancelSubscription = useDeleteSubscription()
  const razorpay = useRazorpay()

  const handleRenew = async (id: string) => {
    try {
      await renewSubscription.mutateAsync(id)
    } catch (error) {
      console.error("Failed to renew:", error)
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelSubscription.mutateAsync(id)
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
    }
  }

  const handlePay = async (id: string) => {
    try {
      const res = await razorpay.loadRazorpayScript()
      if (!res) {
        alert("Failed to load Razorpay SDK. Are you online?")
        return
      }

      const orderData = await razorpay.createOrder(id)

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
              subscriptionId: id,
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
          name: "Member Name",
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

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[var(--on-primary)] leading-none">Subscriptions</h1>
          <p className="text-sm text-[var(--mute)]">Manage active, pending, and expired subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/subscriptions/expiring">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--canvas-light)] border border-orange-200 text-orange-500 hover:bg-orange-50 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Clock className="w-4 h-4" />
              Expiring Soon
            </button>
          </Link>
          {!isTrainer && (
            <Link href="/subscriptions/new">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#6C47FF] hover:bg-[#5b3ce0] text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                <Plus className="w-4 h-4" />
                New Subscription
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* METRIC CARDS */}
      <SubscriptionDashboardCards />

      {/* SEARCH/FILTER BAR & TABLE */}
      <SubscriptionTable
        subscriptions={data?.data || []}
        meta={data?.meta}
        page={page}
        onPageChange={setPage}
        isLoading={isLoading}
        onRenew={handleRenew}
        onCancel={handleCancel}
        onPay={handlePay}
      />
    </div>
  )
}
