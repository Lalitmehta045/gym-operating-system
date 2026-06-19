"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { SubscriptionTable } from "@/components/subscriptions/SubscriptionTable"
import { useSubscriptions, useRenewSubscription, useDeleteSubscription } from "@/hooks/api/useSubscriptions"
import { useRazorpay } from "@/hooks/api/useRazorpay"

export default function SubscriptionsPage() {
  const { data, isLoading, refetch } = useSubscriptions()
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#171717]">Subscriptions</h1>
          <p className="text-sm text-[#888888]">Manage active, pending, and expired subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Link href="/subscriptions/expiring">
            <Button variant="secondary" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
              <AlertCircle className="mr-2 h-4 w-4" />
              Expiring Soon
            </Button>
          </Link>
          <Link href="/subscriptions/new">
            <Button variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              New Subscription
            </Button>
          </Link>
        </div>
      </div>

      <SubscriptionTable
        subscriptions={data?.data || []}
        isLoading={isLoading}
        onRenew={handleRenew}
        onCancel={handleCancel}
        onPay={handlePay}
      />
    </div>
  )
}
