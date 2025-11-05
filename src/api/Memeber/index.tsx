import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import UserContext from "../../context/user/userContext";
import { toast } from "react-toastify";
import { get, post, put } from "../Api";
import axios from "axios";
import TokenService from "../token/tokenService";



export const useGetMemberDetails = (userId: string | null) => {
  const { getUser, setUser } = useContext(UserContext);
  return useQuery({
    queryKey: ["memberDetails", userId], // Cache key
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
    const response = await put(`/user/activate-package/${memberId}`, 
      {}, 
    );
    console.log("Package Activated:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error activating package:",
      error.response?.data || error.message
    );
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
      const errorMessage =
        err.response?.data?.message;
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    },
  });
};
// In your api/Memeber.js - Create a new hook
export const useGetTransactionDetails = (status = "all") => {
  return useQuery({
    queryKey: ["transactionsWithConfig", status],
    queryFn: async () => {
      const response = await get(`/user/transactions?status=${status}`);
      
      if (response.success) {
        return response; // Return full response
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

  })
}

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketData: any) => {
    return await post("/user/ticket", ticketData);
    },
    onSuccess: (response) => {
      if (response.success){
        toast.success(response.message)
        queryClient.invalidateQueries({ queryKey: ["TicketDetails"] });
        return response.ticket;
      }else{
        throw new Error(response.message)
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
}

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
  })
}

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
      const errorMessage =
        err.response?.data?.message;
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
        return response.epins
      } else {
        throw new Error(response.message || "Failed to fetch package history");
      }
    }
  })
}

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

// Add these to your existing queries file
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
      // Log commission data if available for debugging
      if (response.success && (response.data?.commissions || response.commissions)) {
        console.log("Commission data received:", response.data?.commissions || response.commissions);
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        // Toast will be shown in component with commission details
        // Only show basic success message here
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
      // 1. Get signature from backend
      const authRes = await get("/image-kit-auth"); 
      const { signature, expire, token } = authRes;

      // 2. Prepare form data
      const data = new FormData();
      data.append("file", file);
       data.append("fileName", username); 
      data.append("publicKey", import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      data.append("signature", signature);
      data.append("expire", expire);
      data.append("token", token);
      data.append("folder", "/mscs-profile-images"); // optional folder

      // 3. Upload to ImageKit
      const uploadRes = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        data
      );

      return uploadRes.data; // contains URL in .url
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
    mutationFn: async (transactionId) => {
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
 }else{
  throw new Error(response.message || "Failed to fetch level-benifits data" )
 }
    }
  })
}

export const useGetDailyPayout = (memberId: any) => {
  return useQuery({
    queryKey: ["daily-payout", memberId],
    queryFn: async () => {
      const response = await get(`/user/daily-payout/${memberId}`);
      console.log('API res:', response)
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


export const useRepayLoan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, amount }: { memberId: any | number; amount: any }) => {
      const response = await post(`/user/repayment-loan/${memberId}`, { amount });
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        // Refresh transactions data
        queryClient.invalidateQueries({ queryKey: ["transactionDetails"] });
        toast.success(response.message || "Loan repayment processed successfully!");
      } else {
        throw new Error(response.message || "Repayment failed");
      }
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to process loan repayment";
      toast.error(errorMessage);
    },
  });
};

// Create Cashfree repayment order and return redirect/payment link

export const useCreateRepaymentOrder = () => {
  return useMutation({
    mutationFn: async (paymentData: any) => {
      console.log("🔄 Creating Cashfree order...", paymentData);
      const response = await post("/payments/create-order", paymentData);

      if (!response) throw new Error("No response from server");

      const data = response.data || response;
      if (!data.payment_session_id) {
        console.error("❌ Missing payment_session_id:", data);
        throw new Error("Invalid Cashfree order response");
      }

      return data;
    },

    onSuccess: (data: any) => {
      console.log("✅ Cashfree order created successfully:", data);

      const paymentSessionId = data.payment_session_id;
      // const orderId = data.order_id;

      if (!window.Cashfree) {
        toast.error("Cashfree SDK not loaded. Please refresh the page.");
        return;
      }

      const cashfree = new window.Cashfree({
        mode: "sandbox", // or "production" when live
      });

      // Open Cashfree checkout popup
      cashfree
        .checkout({
          paymentSessionId,
          redirectTarget: "_self", // can be '_modal' or '_blank'
        })
        .then(() => {
          console.log("💰 Cashfree checkout completed");
        })
        .catch((error: any) => {
          console.error("❌ Cashfree checkout error:", error);
          toast.error("Payment failed or canceled");
        });
    },

    onError: (error: any) => {
      console.error("❌ Failed to create Cashfree order:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to initialize payment";
      toast.error(message);
    },
  });
};
