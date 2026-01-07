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

  const getAuthToken = () =>
    JSON.parse(localStorage.getItem("auth") || "{}")?.access_token || "";

  const formatCurrency = (v = 0) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  // Load draft và services
  useEffect(() => {
    const draftStr = localStorage.getItem("bookingDraft");
    if (!draftStr || !reservationId) {
      navigate("/booking");
      return;
    }
    const draftData = JSON.parse(draftStr);
    setDraft(draftData);
    fetchServices();
  }, [navigate, reservationId]);

  // Tự động finalize sau khi draft và services đã load
  useEffect(() => {
    if (draft && Object.keys(services).length > 0 && step === 1) {
      finalizeBooking();
    }
  }, [draft, services, step]);

  const fetchServices = async () => {
    try {
      const res = await fetch("http://localhost:8000/booking/services", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (res.ok) {
        const servicesData = await res.json();
        setServices(servicesData);
      } else {
        console.error("Failed to load services");
      }
    } catch (e) {
      console.error("Load services failed", e);
    }
  };

  const finalizeBooking = async () => {
    if (!draft) return;

    try {
      setLoading(true);

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

      console.log("🚀 Payload gửi lên BE /finalize:", payload);

      const res = await fetch(
        `http://localhost:8000/booking/${reservationId}/finalize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Finalize error response:", err); // Log full error
        throw new Error(err.detail || "Không thể hoàn tất đặt chỗ");
      }

      const data = await res.json();
      console.log("✅ Finalize success:", data); // Log success data
      setFinalizeResult(data);

      // Cập nhật draft với finalizeResult
      const updatedDraft = { ...draft, finalize: data };
      setDraft(updatedDraft);
      localStorage.setItem("bookingDraft", JSON.stringify(updatedDraft));

      setStep(3); // Chuyển trực tiếp sang bước dịch vụ sau finalize thành công
    } catch (e) {
      console.error("Finalize error:", e);
      alert(e.message);
      // Nếu fail, có thể set step về 1 hoặc handle khác, nhưng giữ step 1 để retry nếu cần
    } finally {
      setLoading(false);
    }
  };

  const addServices = async () => {
    if (!finalizeResult) return setStep(4);

    const payload = [];
    finalizeResult.passenger_details.forEach((pd) => {
      const selected = selectedServices[pd.passenger_id];
      if (!selected) return;

      Object.values(selected).forEach((svc) => {
        if (svc && pd.reservation_detail_id && svc.service_id) {
          // Thêm check fields tồn tại
          payload.push({
            reservation_detail_id: Number(pd.reservation_detail_id), // Ensure number
            service_id: Number(svc.service_id), // Ensure number
            quantity: 1,
          });
        }
      });
    });

    console.log("🚀 Payload gửi lên BE /services:", { services: payload }); // Log payload before send

    if (payload.length === 0) {
      console.log("No services selected, skipping addServices");
      return setStep(4);
    }

    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/booking/${reservationId}/services`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ services: payload }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Add services error response:", err); // Log full error detail
        throw new Error(err.detail || "Không thể thêm dịch vụ");
      }

      console.log("✅ Add services success"); // Log success
      setStep(4);
    } catch (e) {
      console.error("Add services error:", e);
      alert(`Không thể thêm dịch vụ: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async (method) => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:8000/booking/${reservationId}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({ payment_method: method }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        console.error("Create payment error:", err);
        throw new Error(err.detail || "Không thể tạo payment");
      }

      const data = await res.json();
      console.log("✅ Create payment success:", data);

      // Navigate to /payment with state containing reservationId and paymentId
      navigate("/payment", {
        state: {
          reservationId: reservationId,
          paymentId: data.payment.payment_id,
        },
      });
    } catch (e) {
      console.error("Create payment error:", e);
      alert(`Không thể tạo payment: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!draft) return <div>Đang tải...</div>;

  return (
    <div className="review-page">
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
                              [category]: isSelected ? null : svc, // Toggle: nếu đã chọn thì bỏ, ngược lại chọn
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
          <button
            onClick={() => createPayment("credit_card")}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "💳 Thẻ tín dụng"}
          </button>
          <button
            onClick={() => createPayment("bank_transfer")}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "🏦 Chuyển khoản ngân hàng"}
          </button>
          <button onClick={() => createPayment("e_wallet")} disabled={loading}>
            {loading ? "Đang xử lý..." : "📱 Ví điện tử"}
          </button>
        </>
      )}
    </div>
  );
};

export default ReviewPage;
