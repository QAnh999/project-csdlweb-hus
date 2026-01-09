import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/payment.css";

const API = process.env.REACT_APP_API_URL;

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
      const res = await fetch(`${API}/booking/${reservationId}`, {
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
    if (
      !paymentId ||
      !reservationId ||
      processing ||
      payment?.status === "paid"
    )
      return;

    try {
      setProcessing(true);
      const res = await fetch(`${API}/booking/payment/${paymentId}/confirm`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

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
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(v);

  if (loading) return <div>Đang tải thông tin thanh toán...</div>;
  if (!payment) return <div>Không tìm thấy thanh toán</div>;

  return (
    <div className="payment-wrapper">
      <header className="site-header">
        <a href="/" className="logo">
          <img
            src="/assets/Lotus_Logo-removebg-preview.png"
            alt="Lotus Travel"
          />
          <span>Lotus Travel</span>
        </a>
      </header>

      {/* <div className="payment-page">
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
      </div> */}

      <div className="payment-page-container">
        <h2>Chi tiết thanh toán</h2>
        <div className="payment-page">
          {/* PAYMENT INFO */}
          <div className="payment-card">
            <h3>Thông tin thanh toán</h3>
            <p>
              <strong>Phương thức:</strong> {payment.payment_method}
            </p>
            <p>
              <strong>Trạng thái:</strong> {payment.status}
            </p>
            <p>
              <strong>Thanh toán lúc:</strong>{" "}
              {payment.paid_at || "Chưa thanh toán"}
            </p>
          </div>

          {/* INVOICE */}
          {invoice && (
            <div className="payment-card invoice">
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
            </div>
          )}

          {/* ACTION */}
          {payment.status !== "completed" && (
            <div className="payment-actions">
              <button onClick={confirmPayment} disabled={processing}>
                {processing ? "Đang xác nhận..." : "Xác nhận thanh toán"}
              </button>
              {processing && (
                <div className="warning">Đang xác nhận... Vui lòng chờ.</div>
              )}
            </div>
          )}

          {/* SUCCESS */}
          {payment.status === "completed" && (
            <div className="success-card">
              <h3>✅ Thanh toán thành công!</h3>
              <div className="success-actions">
                <button onClick={() => navigate("/myflights")}>
                  Xem đơn đặt vé
                </button>
                <button onClick={() => navigate("/")}>Về trang chủ</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
