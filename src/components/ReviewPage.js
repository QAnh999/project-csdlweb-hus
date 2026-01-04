import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../style/review.css";

const ReviewPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reservationId = searchParams.get("reservation_id");

  const [draft, setDraft] = useState(null);
  const [services, setServices] = useState({});
  const [selectedServices, setSelectedServices] = useState({});
  const [finalizeResult, setFinalizeResult] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null); // Thêm state để lưu lỗi payment

  const getAuthToken = () =>
    JSON.parse(localStorage.getItem("auth") || "{}")?.access_token || "";

  const formatCurrency = (v = 0) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  // Load draft và services
  useEffect(() => {
    console.log("🔍 useEffect: Loading draft and services");
    const draftStr = localStorage.getItem("bookingDraft");
    console.log("📦 Draft from localStorage:", draftStr);

    if (!draftStr || !reservationId) {
      console.error(
        "❌ Missing draft or reservationId, redirecting to /booking"
      );
      navigate("/booking");
      return;
    }

    const draftData = JSON.parse(draftStr);
    console.log("✅ Draft parsed:", draftData);
    setDraft(draftData);
    fetchServices();
  }, [navigate, reservationId]);

  // Tự động finalize sau khi draft và services đã load
  useEffect(() => {
    console.log("🔍 useEffect: Auto-finalize check", {
      hasDraft: !!draft,
      servicesCount: Object.keys(services).length,
      currentStep: step,
    });

    if (draft && Object.keys(services).length > 0 && step === 1) {
      console.log("🚀 Triggering auto-finalize");
      finalizeBooking();
    }
  }, [draft, services, step]);

  const fetchServices = async () => {
    console.log("🔍 fetchServices: Starting...");
    try {
      const url = "http://localhost:8000/booking/services";
      console.log("📡 Calling:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", res.status);

      if (res.ok) {
        const servicesData = await res.json();
        console.log("✅ Services loaded:", servicesData);
        setServices(servicesData);
      } else {
        const errorText = await res.text();
        console.error("❌ Failed to load services:", res.status, errorText);
      }
    } catch (e) {
      console.error("❌ Load services failed", e);
    }
  };

  const finalizeBooking = async () => {
    console.log("🔍 finalizeBooking: Starting...", { draft, reservationId });

    if (!draft) {
      console.error("❌ No draft available");
      return;
    }

    try {
      setLoading(true);
      console.log("⏳ Loading started for finalize");

      // Lấy seatMap từ draft cho main và return flight
      const main_seat_map = draft.passengers.map((p) => ({
        passenger_id: p.passenger_id,
        seat_id: p.seatMap?.main || p.seatMap?.outbound,
      }));

      const return_seat_map =
        draft.tripType === "roundtrip"
          ? draft.passengers.map((p) => ({
              passenger_id: p.passenger_id,
              seat_id: p.seatMap?.inbound,
            }))
          : null;

      const payload = {
        seat_class: draft.cabinClass,
        main_seat_map,
        return_seat_map,
      };

      console.log(
        "🚀 Payload gửi lên BE /finalize:",
        JSON.stringify(payload, null, 2)
      );

      const url = `http://localhost:8000/booking/${reservationId}/finalize`;
      console.log("📡 Calling:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 Response status:", res.status);
      console.log(
        "📡 Response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Finalize error response:", errText);
        let errorDetail = "Không thể hoàn tất đặt chỗ";

        try {
          const errJson = JSON.parse(errText);
          errorDetail = errJson.detail || errorDetail;
        } catch {
          errorDetail = errText || errorDetail;
        }

        throw new Error(errorDetail);
      }

      const data = await res.json();
      console.log("✅ Finalize success:", JSON.stringify(data, null, 2));
      setFinalizeResult(data);

      // Cập nhật draft với finalizeResult
      const updatedDraft = { ...draft, finalize: data };
      setDraft(updatedDraft);
      localStorage.setItem("bookingDraft", JSON.stringify(updatedDraft));

      console.log("🔄 Moving to step 3 (services)");
      setStep(3);
    } catch (e) {
      console.error("❌ Finalize error:", e);
      alert(`Lỗi finalize: ${e.message}`);
    } finally {
      console.log("🏁 Loading finished for finalize");
      setLoading(false);
    }
  };

  const addServices = async () => {
    console.log("🔍 addServices: Starting...", {
      finalizeResult,
      selectedServices,
    });

    if (!finalizeResult) {
      console.log("⚠️ No finalizeResult, skipping to step 4");
      return setStep(4);
    }

    const payload = [];
    finalizeResult.passenger_details.forEach((pd) => {
      const selected = selectedServices[pd.passenger_id];
      if (!selected) return;

      Object.values(selected).forEach((svc) => {
        if (svc && pd.reservation_detail_id && svc.service_id) {
          console.log(
            `➕ Adding service for passenger ${pd.passenger_id}:`,
            svc
          );
          payload.push({
            reservation_detail_id: Number(pd.reservation_detail_id),
            service_id: Number(svc.service_id),
            quantity: 1,
          });
        }
      });
    });

    console.log("🚀 Payload gửi lên BE /services:", {
      services: payload,
      payloadLength: payload.length,
    });

    if (payload.length === 0) {
      console.log(
        "ℹ️ No services selected, skipping addServices and moving to step 4"
      );
      return setStep(4);
    }

    try {
      setLoading(true);
      const url = `http://localhost:8000/booking/${reservationId}/services`;
      console.log("📡 Calling:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ services: payload }),
      });

      console.log("📡 Response status:", res.status);

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ Add services error response:", errText);
        let errorDetail = "Không thể thêm dịch vụ";

        try {
          const errJson = JSON.parse(errText);
          errorDetail = errJson.detail || errorDetail;
        } catch {
          errorDetail = errText || errorDetail;
        }

        throw new Error(errorDetail);
      }

      const responseData = await res.json();
      console.log("✅ Add services success:", responseData);
      setStep(4);
    } catch (e) {
      console.error("❌ Add services error:", e);
      alert(`Không thể thêm dịch vụ: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (method) => {
    console.log("🔍 createPayment: Starting...", {
      method,
      reservationId,
      tokenAvailable: !!getAuthToken(),
    });

    // Reset error trước khi thử
    setPaymentError(null);

    try {
      setLoading(true);

      const url = `http://localhost:8000/booking/${reservationId}/payment`;
      console.log("📡 Calling payment API:", url);

      const payload = { payment_method: method };
      console.log("📦 Payment payload:", payload);

      const res = await fetch(url, {
        method: "POST",
        mode: "cors", // Thêm mode cors
        credentials: "include", // Thử include credentials nếu cần
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("📡 Payment response status:", res.status);
      console.log(
        "📡 Payment response headers:",
        Object.fromEntries(res.headers.entries())
      );

      if (!res.ok) {
        let errorDetail = "Không thể tạo payment";

        try {
          const errText = await res.text();
          console.error("❌ Payment error response text:", errText);

          // Cố gắng parse JSON
          try {
            const errJson = JSON.parse(errText);
            errorDetail = errJson.detail || errJson.message || errorDetail;
            console.error("❌ Payment error JSON:", errJson);
          } catch {
            errorDetail = errText || errorDetail;
          }
        } catch (e) {
          console.error("❌ Error reading error response:", e);
          errorDetail = "Không thể đọc phản hồi từ server";
        }

        throw new Error(errorDetail);
      }

      const data = await res.json();
      console.log("✅ Create payment success:", JSON.stringify(data, null, 2));

      // Kiểm tra dữ liệu trả về
      if (!data.payment || !data.payment.payment_id) {
        console.error("❌ Payment response missing payment data:", data);
        throw new Error("Thiếu thông tin payment từ server");
      }

      // Navigate to payment page
      console.log("🔄 Navigating to /payment with:", {
        reservationId,
        paymentId: data.payment.payment_id,
      });

      navigate("/payment", {
        state: {
          reservationId: reservationId,
          paymentId: data.payment.payment_id,
        },
      });
    } catch (e) {
      console.error("❌ Create payment error:", e);
      setPaymentError(e.message); // Lưu lỗi để hiển thị
      alert(`Không thể tạo payment: ${e.message}`);
    } finally {
      console.log("🏁 Payment process finished");
      setLoading(false);
    }
  };

  // Thêm hàm để retry payment
  const retryPayment = () => {
    console.log("🔄 Retrying payment...");
    setPaymentError(null);
  };

  if (!draft) return <div>Đang tải...</div>;

  return (
    <div className="review-page">
      {/* Debug info - có thể ẩn sau khi fix xong */}
      <div
        style={{
          backgroundColor: "#f5f5f5",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "5px",
          fontSize: "12px",
        }}
      >
        <strong>Debug Info:</strong>
        <div>Step: {step}</div>
        <div>Reservation ID: {reservationId}</div>
        <div>Loading: {loading ? "Yes" : "No"}</div>
        {paymentError && (
          <div style={{ color: "red" }}>Payment Error: {paymentError}</div>
        )}
      </div>

      {step === 1 && (
        <div>
          <h2>Đang hoàn tất đặt chỗ...</h2>
          {loading && <p>Đang xử lý...</p>}
        </div>
      )}

      {step === 3 && (
        <>
          <h2>Dịch vụ bổ sung</h2>
          {draft.passengers.map((p) => (
            <div key={`passenger-${p.passenger_id}-services`} className="card">
              <strong>
                {p.info.last_name} {p.info.first_name}
              </strong>
              {Object.entries(services).map(([category, list]) => (
                <div key={category}>
                  <h4>{category}</h4>
                  {list.map((svc) => {
                    const isSelected =
                      selectedServices[p.passenger_id]?.[category]
                        ?.service_id === svc.service_id;
                    return (
                      <div
                        key={`service-${svc.service_id}-${p.passenger_id}`}
                        onClick={() =>
                          setSelectedServices((prev) => ({
                            ...prev,
                            [p.passenger_id]: {
                              ...prev[p.passenger_id],
                              [category]: isSelected ? null : svc,
                            },
                          }))
                        }
                        style={{
                          cursor: "pointer",
                          margin: "2px 0",
                          padding: "8px",
                          border: "1px solid #ddd",
                          backgroundColor: isSelected
                            ? "#e3f2fd"
                            : "transparent",
                          borderRadius: "4px",
                        }}
                      >
                        {svc.service_name} – {formatCurrency(svc.base_price)}
                        {isSelected && " (Đã chọn)"}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
          <button onClick={addServices} disabled={loading}>
            {loading ? "Đang thêm..." : "Tiếp tục thanh toán"}
          </button>
        </>
      )}

      {step === 4 && (
        <>
          <h2>Thanh toán</h2>

          {paymentError && (
            <div
              style={{
                backgroundColor: "#ffebee",
                padding: "10px",
                marginBottom: "15px",
                borderRadius: "5px",
                color: "#c62828",
              }}
            >
              <strong>Lỗi thanh toán:</strong> {paymentError}
              <button
                onClick={retryPayment}
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
              >
                Thử lại
              </button>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={() => createPayment("credit_card")}
              disabled={loading}
              style={{ flex: 1, padding: "15px" }}
            >
              {loading ? "Đang xử lý..." : "💳 Thẻ tín dụng"}
            </button>
            <button
              onClick={() => createPayment("bank_transfer")}
              disabled={loading}
              style={{ flex: 1, padding: "15px" }}
            >
              {loading ? "Đang xử lý..." : "🏦 Chuyển khoản ngân hàng"}
            </button>
            <button
              onClick={() => createPayment("e_wallet")}
              disabled={loading}
              style={{ flex: 1, padding: "15px" }}
            >
              {loading ? "Đang xử lý..." : "📱 Ví điện tử"}
            </button>
          </div>

          {/* Debug log panel */}
          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f9f9f9",
              border: "1px solid #ddd",
              borderRadius: "5px",
            }}
          >
            <h4>Thông tin gỡ lỗi:</h4>
            <p>
              <strong>Reservation ID:</strong> {reservationId}
            </p>
            <p>
              <strong>Draft có dữ liệu:</strong> {draft ? "Có" : "Không"}
            </p>
            <p>
              <strong>Token có sẵn:</strong> {getAuthToken() ? "Có" : "Không"}
            </p>
            <button
              onClick={() =>
                console.log("Current state:", {
                  draft,
                  reservationId,
                  step,
                  finalizeResult,
                  selectedServices,
                })
              }
              style={{ padding: "5px 10px", marginTop: "10px" }}
            >
              Log State to Console
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewPage;
