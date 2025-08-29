import React, {useState} from 'react';

function CouponApply() {
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      // Handle coupon application logic here
      console.log('Applying coupon:', couponCode);
      // You can add API call or validation logic here
    }
  };

  const handleInputChange = e => {
    setCouponCode(e.target.value);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <input
          type="text"
          placeholder="Enter Coupon Code"
          value={couponCode}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          style={styles.input}
        />
        <button
          onClick={handleApplyCoupon}
          style={styles.applyButton}
          disabled={!couponCode.trim()}>
          APPLY
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  inputContainer: {
    display: 'flex',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    backgroundColor: 'transparent',
    color: '#333',
  },
  applyButton: {
    padding: '12px 20px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};

export default CouponApply;
