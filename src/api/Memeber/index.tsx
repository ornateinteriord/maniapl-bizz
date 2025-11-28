// api/Member.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import UserContext from "../../context/user/userContext";
import { toast } from "react-toastify";
import { get, post, put } from "../Api";
import axios from "axios";
import TokenService from "../token/tokenService";
import { CreateOrderRequest, CreateOrderResponse } from "../../types/payments";

// Webhook handler for processing payment events from Cashfree
export const useHandlePaymentWebhook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (webhookData: any) => {
      console.log("🔄 Processing payment webhook...", webhookData);
      
      const response = await post(`/payments/webhook`, webhookData);
      
      if (!response) throw new Error("No response from server");
      
      const data = response.data || response;
      
      console.log("📥 Webhook processed:", data);
      
      if (data.success === false) {
        throw new Error(data.message || "Webhook processing failed");
      }
      
      return data;
    },
    
    onSuccess: (data: any) => {
      console.log("✅ Webhook processed successfully:", data);
      
      queryClient.invalidateQueries({ queryKey: ["transactionsWithConfig"] });
      queryClient.invalidateQueries({ queryKey: ["walletOverview"] });
      queryClient.invalidateQueries({ queryKey: ["memberDetails"] });
      
      if (data.type === "payment_success") {
        toast.success("Payment successful! Loan repayment processed.");
      } else if (data.type === "payment_failed") {
        toast.error("Payment failed. Please try again.");
      } else {
        toast.info("Payment status updated.");
      }
    },
    
    onError: (error: any) => {
      console.error("❌ Failed to process webhook:", error);
      console.error("❌ Error details:", error.response?.data);
      
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process payment notification";
      toast.error(message);
    },
  });
};

// Process successful loan repayment
export const useProcessLoanRepayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, transactionId }: { memberId: string; transactionId: string }) => {
      console.log("🔄 Processing loan repayment...", { memberId, transactionId });
      
      const response = await post(`/payments/process-successful-payment`, {
        memberId,
        transactionId
      });
      
      if (!response) throw new Error("No response from server");
      
      const data = response.data || response;
      
      if (data.success === false) {
        throw new Error(data.message || "Failed to process loan repayment");
      }
      
      return data;
    },
    
    onSuccess: (data: any) => {
      console.log("✅ Loan repayment processed:", data);
      toast.success("Loan repayment processed successfully!");
      
      queryClient.invalidateQueries({ queryKey: ["transactionsWithConfig"] });
      queryClient.invalidateQueries({ queryKey: ["walletOverview"] });
      queryClient.invalidateQueries({ queryKey: ["memberDetails"] });
    },
    
    onError: (error: any) => {
      console.error("❌ Failed to process loan repayment:", error);
      
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process loan repayment";
      toast.error(message);
    },
  });
};

// Revert failed loan repayment
export const useRevertLoanRepayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, transactionId }: { memberId: string; transactionId: string }) => {
      console.log("🔄 Reverting loan repayment...", { memberId, transactionId });
      
      const response = await post(`/payments/process-failed-payment`, {
        memberId,
        transactionId
      });
      
      if (!response) throw new Error("No response from server");
      
      const data = response.data || response;
      
      if (data.success === false) {
        throw new Error(data.message || "Failed to revert loan repayment");
      }
      
      return data;
    },
    
    onSuccess: (data: any) => {
      console.log("✅ Loan repayment reverted:", data);
      toast.info("Payment failed. Loan status reverted.");
      
      queryClient.invalidateQueries({ queryKey: ["transactionsWithConfig"] });
      queryClient.invalidateQueries({ queryKey: ["walletOverview"] });
      queryClient.invalidateQueries({ queryKey: ["memberDetails"] });
    },
    
    onError: (error: any) => {
      console.error("❌ Failed to revert loan repayment:", error);
      console.error("CRITICAL: Failed to revert loan repayment - manual intervention may be required");
      
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to revert loan repayment - contact support";
      toast.error(message);
    },
  });
};


// Get Cashfree mode based on environment
const getCashfreeMode = (paymentSessionId?: string): "production" | "sandbox" => {
  // First check if we can determine mode from paymentSessionId
  if (paymentSessionId) {
    // Sandbox session IDs typically have "test" or "sandbox" in them
    if (paymentSessionId.toLowerCase().includes('test') || paymentSessionId.toLowerCase().includes('sandbox')) {
      return "sandbox";
    }
    // If it doesn't contain test indicators, assume production
    return "production";
  }
  
  // Fallback to environment variable
  const apiBase = import.meta.env.VITE_CASHFREE_API_BASE || "";
  return apiBase.includes("sandbox") ? "sandbox" : "production";
};

// Load Cashfree SDK dynamically
const loadCashfreeSDK = (paymentSessionId?: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) {
      console.log("✅ Cashfree SDK already loaded");
      resolve();
      return;
    }

    const script = document.createElement("script");
    const mode = getCashfreeMode(paymentSessionId);
    script.src = `https://sdk.cashfree.com/js/v3/cashfree.js`;
    
    script.onload = () => {
      console.log("✅ Cashfree SDK loaded successfully in", mode, "mode");
      resolve();
    };
    
    script.onerror = (error) => {
      console.error("❌ Failed to load Cashfree SDK:", error);
      reject(new Error("Failed to load payment system"));
    };
    
    document.head.appendChild(script);
  });
};

// Initialize Cashfree checkout
const initializeCashfreeCheckout = async (paymentSessionId: string): Promise<void> => {
  try {
    console.log("🚀 Initializing Cashfree checkout...");
    
    // Ensure SDK is loaded
    await loadCashfreeSDK(paymentSessionId);
    
    const mode = getCashfreeMode(paymentSessionId);
    console.log("🔄 Cashfree mode:", mode);
    
    if (!window.Cashfree) {
      throw new Error("Cashfree SDK not available after loading");
    }
    
    const cashfree = new window.Cashfree({
      mode: mode,
    });
    
    console.log("💳 Starting checkout with paymentSessionId:", paymentSessionId);
    
    const result = await cashfree.checkout({
      paymentSessionId,
      redirectTarget: "_self",
    });
    
    console.log("💰 Payment checkout completed:", result);
    
  } catch (error: any) {
    console.error("❌ Payment checkout error:", error);
    
    let errorMessage = "Payment initialization failed";
    if (error?.message?.includes("network")) {
      errorMessage = "Network error. Please check your connection and try again.";
    } else if (error?.message?.includes("400")) {
      errorMessage = "Invalid payment session. Please try again.";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
    throw error;
  }
};

// Create Cashfree repayment order and return redirect/payment link
export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: async (paymentData: CreateOrderRequest): Promise<CreateOrderResponse> => {
      console.log("🔄 Creating payment order...", paymentData);
      
      const response = await post(`/payments/create-order`, paymentData);
      
      if (!response) throw new Error("No response from server");
      
      const data = response.data || response;
      
      console.log("📥 Backend response:", data);
      
      if (data.success === false) {
        throw new Error(data.message || "Payment order creation failed");
      }
      
      if (!data.payment_session_id) {
        console.error("❌ Missing payment_session_id:", data);
        throw new Error("Invalid payment order response - missing payment_session_id");
      }
      
      return data;
    },
    
    onSuccess: async (data: CreateOrderResponse) => {
      console.log("✅ Payment order created successfully:", data);
      
      try {
        await initializeCashfreeCheckout(data.payment_session_id);
        toast.success("Redirecting to payment gateway...");
      } catch (error) {
        console.error("❌ Failed to initialize payment checkout:", error);
        // Error is already handled in initializeCashfreeCheckout
      }
    },
    
    onError: (error: any) => {
      console.error("❌ Failed to create payment order:", error);
      console.error("❌ Error details:", error.response?.data);
      
      let message = "Unable to initialize payment";
      
      if (error.response?.data?.code === "payment_session_id_invalid") {
        message = "Payment session is invalid or expired. Please try again.";
      } else if (error.response?.data?.code === "order_meta.return_url_invalid") {
        message = "Return URL configuration error. Please contact support.";
      } else {
        message = error?.response?.data?.message || error?.message || message;
      }
      
      toast.error(message);
    },
  });
};

// Enhanced loan repayment hook
export const useRepayLoan = () => {
  const createPaymentOrder = useCreatePaymentOrder();

  return useMutation({
    mutationFn: async ({ memberId, amount, memberDetails }: { 
      memberId: string; 
      amount: number;
      memberDetails?: any;
    }) => {
      console.log("💰 Creating loan repayment order...", { memberId, amount });
      
      const paymentData: CreateOrderRequest = {
        amount,
        currency: "INR",
        customer: {
          customer_id: memberId,
          customer_email: memberDetails?.email || "",
          customer_phone: memberDetails?.mobileno || "",
          customer_name: memberDetails?.Name || ""
        },
        notes: {
          isLoanRepayment: true
        }
      };

      return await createPaymentOrder.mutateAsync(paymentData);
    },
    
    onSuccess: (data: CreateOrderResponse) => {
      console.log("✅ Loan repayment initiated successfully:", data);
      // The actual payment flow is handled in useCreatePaymentOrder's onSuccess
    },
    
    onError: (error: any) => {
      console.error("❌ Loan repayment failed:", error);
      const errorMessage = error?.message || "Failed to process loan repayment";
      toast.error(errorMessage);
    },
  });
};

// Rest of your existing hooks remain the same...
export const useGetMemberDetails = (userId: string | null) => {
  const { getUser, setUser } = useContext(UserContext);
  return useQuery({
    queryKey: ["memberDetails", userId],
    queryFn: async () => {
      const response = await getUser(userId);
      if (response.success) {
        setUser(response.data);
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch member details");
      }
    },
    enabled: !!userId,
  });
};

export const activateMemberPackage = async (memberId:any) => {
  try {
    const response = await put(`/user/activate-package/${memberId}`, {});
    console.log("Package Activated:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error activating package:", error.response?.data || error.message);
    throw error;
  }
};

export const useUpdateMember = () => {
  const userId = TokenService.getUserId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return await put(`/user/member/${userId}`, data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["memberDetails"] });
        return response.data;
      } else {
        console.error("Login failed:", response.message);
      }
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message;
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    },
  });
};

export const useGetTransactionDetails = (status = "all") => {
  return useQuery({
    queryKey: ["transactionsWithConfig", status],
    queryFn: async () => {
      const response = await get(`/user/transactions?status=${status}`);
      
      if (response.success) {
        return response;
      } else {
        throw new Error(response.message || "Failed to fetch transactions");
      }
    },
  });
};

export const useGetTicketDetails = (userId:string) => {
  return useQuery({
    queryKey: ["TicketDetails", userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await get(`/user/ticket/${userId}`);
      if (response?.success && Array.isArray(response?.tickets)) {
        return response.tickets;
      } else {
        throw new Error(response.message || "Failed to fetch tickets");
      }
    },
    enabled: !!userId,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketData: any) => {
      return await post("/user/ticket", ticketData);
    },
    onSuccess: (response) => {
      if (response.success){
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["TicketDetails"] });
        return response.ticket;
      } else {
        throw new Error(response.message);
      } 
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create ticket. Please try again.");
    },
  });
};

export const getUsedandUnusedPackages = ({memberId , status} : {memberId : string |  null,status : string}) => { 
  return useQuery({
    queryKey: ["usedAndUnusedPackages", memberId, status],
    queryFn: async () => {
      const response = await get("/user/epin" ,{ memberId, status } );
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch packages");
      }
    },
  });
};

export const useGetSponsers = (memberId: any) => {
  return useQuery({
    queryKey : ["sponsers",memberId],
    queryFn : async () => {
      const response = await get(`/user/sponsers/${memberId}`);
      if(response.success){
        return {
          parentUser: response.parentUser,
          sponsoredUsers: response.sponsoredUsers,
        };
      } else {
        throw new Error(response.message || "Failed to fetch sponsers");
      }
    }
  });
};

export const useTransferPackage = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      return await put('/user/transferPackage', data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
      } else {
        console.error("Login failed:", response.message);
      }
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message;
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    },
  });
};

export const useGetPackagehistory = () => {
  const memberId = TokenService.getMemberId();
  return useQuery({
    queryKey : ["package-history", memberId],
    queryFn : async () => {
      const response = await get('/user/package-history');
      if(response.success){
        return response.epins;
      } else {
        throw new Error(response.message || "Failed to fetch package history");
      }
    }
  });
};

export const useCheckSponsorReward = (memberId: any) => {
  return useQuery({
    queryKey: ["checkSponsorReward", memberId],
    queryFn: async () => {
      if (!memberId) return Promise.resolve({}); 
      const response = await get(`/user/check-sponsor-reward/${memberId}`);
      return response; 
    },
    enabled: !!memberId,
  });
};

export const useGetWalletOverview = (memberId: any) => {
  return useQuery({
    queryKey: ["walletOverview", memberId],
    queryFn: async () => {
      const response = await get(`/user/overview/${memberId}`);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch wallet overview");
      }
    },
    enabled: !!memberId,
  });
};

export const useWalletWithdraw = (memberId:any) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { memberId: string; amount: string }) => {
      return await post(`user/withdraw/${memberId}`, data);
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["walletOverview"] });
        return response.data;
      } else {
        throw new Error(response.message || "Withdrawal failed");
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to process withdrawal";
      toast.error(errorMessage);
    },
  }); 
}; 

export const useGetMultiLevelSponsorship = () => {
  return useQuery({
    queryKey: ["multiLevelSponsors"],
    queryFn: async () => {
      const response = await get('/user/multi-level-sponsors');
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch multi-level sponsorship data");
      }
    }
  });
};

export const useActivatePackage = () => {
  return useMutation({
    mutationFn: async (data: { memberId: string; packageType: string }) => {
      const response = await put(`/user/activate-package/${data.memberId}`, {
        packageType: data.packageType,
        activatedAt: new Date().toISOString()
      });
      if (response.success && (response.data?.commissions || response.commissions)) {
        console.log("Commission data received:", response.data?.commissions || response.commissions);
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || "Package activated successfully!");
      } else {
        const errorMessage = response.message || "Activation failed";
        console.error("Activation failed:", errorMessage);
        toast.error(errorMessage);
      }
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred";
      console.error("Activation error:", errorMessage, err);
      toast.error(errorMessage);
    },
  });
};

export const useImageKitUpload = (username: string) => {
  return useMutation<{ url: string }, Error, File>({
    mutationFn: async (file: File) => {
      const authRes = await get("/image-kit-auth"); 
      const { signature, expire, token } = authRes;

      const data = new FormData();
      data.append("file", file);
      data.append("fileName", username); 
      data.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      data.append("signature", signature);
      data.append("expire", expire);
      data.append("token", token);
      data.append("folder", "/mscs-profile-images");

      const uploadRes = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        data
      );

      return uploadRes.data;
    },
  });
};

export const useGetPendingWithdrawals = () => {
  return useQuery({
    queryKey: ["withdrawals", "pending"], 
    queryFn: async () => {
      const response = await get("/user/trasactions/Pending");
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch pending withdrawals");
      }
    }
  });
};

export const useGetApprovedWithdrawals = () => {
  return useQuery({
    queryKey: ["withdrawals", "completed"], 
    queryFn: async () => {
      const response = await get("/user/trasactions/Completed");
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch completed withdrawals");
      }
    }
  });
};

export const useApproveWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transactionId: string) => {
      return await put(`/user/approve-withdrawal/${transactionId}`);
    },
    onMutate: async (transactionId) => {
      await queryClient.cancelQueries({ queryKey: ['withdrawals', 'pending'] });
      
      const previousPending = queryClient.getQueryData(['withdrawals', 'pending']);

      queryClient.setQueryData(['withdrawals', 'pending'], (old: any) => 
        old ? old.filter((t: any) => t.transaction_id !== transactionId) : old
      );
      
      return { previousPending };
    },
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message);
        queryClient.invalidateQueries({ queryKey: ["withdrawals", "completed"] });
      } else {
        toast.error(response.message);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals', 'pending'] });
    },
  });
};

export const useGetlevelbenifits = (memberId: any)=>{
  return useQuery({
    queryKey:["level-benifits",memberId],
    queryFn:async()=>{
      const response = await get (`/user/level-benefits/${memberId}`);
      if (response.success){
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch level-benifits data");
      }
    }
  });
};

export const useGetDailyPayout = (memberId: any) => {
  return useQuery({
    queryKey: ["daily-payout", memberId],
    queryFn: async () => {
      const response = await get(`/user/daily-payout/${memberId}`);
      console.log('API res:', response);
      if (response?.success) {
        return response?.data?.daily_earnings || [];
      } else {
        throw new Error(response.data?.message || "Failed to fetch daily payout data");
      }
    },
    enabled: !!memberId,
  });
};

export const useClimeLoan = () => {
  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: any }) => {
      const response = await post(`/user/clime-reward-loan/${memberId}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message);
    },
    onError: (error: any) => {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to claim reward loan.";
      toast.error(errorMsg);
      console.error("Error in useClimeLoan:", error);
    },
  });
};

// Webhook handler for processing payment events
export const useHandleWebhook = () => {
  return useMutation({
    mutationFn: async (webhookData: any) => {
      console.log("🔄 Processing webhook data...", webhookData);
      
      const response = await post(`/payments/webhook`, webhookData);
      
      if (!response) throw new Error("No response from server");
      
      const data = response.data || response;
      
      console.log("📥 Webhook processed:", data);
      
      return data;
    },
    
    onSuccess: (data: any) => {
      console.log("✅ Webhook processed successfully:", data);
      toast.success("Payment confirmed successfully!");
    },
    
    onError: (error: any) => {
      console.error("❌ Failed to process webhook:", error);
      console.error("❌ Error details:", error.response?.data);
      
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to process payment notification";
      toast.error(message);
    },
  });
};

// Webhook handler utility (for processing webhook responses)
export const handleWebhookResponse = (webhookData: any) => {
  console.log("🔄 Processing webhook response:", webhookData);
  
  if (webhookData.status === "SUCCESS") {
    toast.success("Payment successful!");
  } else if (webhookData.status === "FAILED") {
    toast.error("Payment failed. Please try again.");
  } else {
    toast.info("Payment status: " + webhookData.status);
  }
  
  return webhookData;
};