import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/payment.css";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { reservationId, paymentId } = location.state || {};

  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const getAuthToken = () =>
    JSON.parse(localStorage.getItem("auth") || "{}")?.access_token || "";

  // Fetch payment & invoice details
  const fetchPaymentData = async () => {
    if (!reservationId) return navigate("/booking");
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8000/booking/${reservationId}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Không thể lấy thông tin thanh toán");
      const data = await res.json();
      setPayment(data.payment);
      setInvoice(data.invoice);
    } catch (e) {
      console.error(e);
      alert(e.message);
      navigate("/booking");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [reservationId]);

  // Confirm payment
  const confirmPayment = async () => {
    if (!paymentId || !reservationId || processing || payment?.status === "paid") return;

    try {
      setProcessing(true);
      const res = await fetch(
        `http://localhost:8000/booking/payment/${paymentId}/confirm`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getAuthToken()}` },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Xác nhận thanh toán thất bại");
      }

      // Reload payment info
      await fetchPaymentData();
    } catch (e) {
      console.error(e);
      alert(e.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (v = 0) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);

  if (loading) return <div>Đang tải thông tin thanh toán...</div>;
  if (!payment) return <div>Không tìm thấy thanh toán</div>;

  return (
    <div className="payment-page">
      <h2>Chi tiết thanh toán</h2>
      <p>
        <strong>Phương thức:</strong> {payment.payment_method}
      </p>
      <p>
        <strong>Trạng thái:</strong> {payment.status}
      </p>
      <p>
        <strong>Thanh toán lúc:</strong> {payment.paid_at || "Chưa thanh toán"}
      </p>

      {invoice && (
        <>
          <h3>Hóa đơn</h3>
          <p>
            <strong>Số hóa đơn:</strong> {invoice.invoice_number}
          </p>
          <p>
            <strong>Tổng:</strong> {formatCurrency(invoice.total_amount)}
          </p>
          <p>
            <strong>Thuế:</strong> {formatCurrency(invoice.tax_amount)}
          </p>
          <p>
            <strong>Hạn thanh toán:</strong>{" "}
            {new Date(invoice.due_date).toLocaleString()}
          </p>
          <p>
            <strong>Trạng thái:</strong> {invoice.status}
          </p>
        </>
      )}

      {payment.status !== "completed" && (
        <>
          <button onClick={confirmPayment} disabled={processing}>
            {processing ? "Đang xác nhận..." : "Xác nhận thanh toán"}
          </button>
          {processing && <div className="warning">Đang xác nhận... Vui lòng chờ.</div>}
        </>
      )}

      {payment.status === "completed" && (
        <div className="success">
          <h3>✅ Thanh toán thành công!</h3>
          <button onClick={() => navigate("/myflights")}>Xem đơn đặt vé</button>
          <button onClick={() => navigate("/")}>Về trang chủ</button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
