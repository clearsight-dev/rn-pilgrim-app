import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
// Fixed Ticket-shaped coupon component with SVG
function CouponTicket({ code, isAutoApplied = false, onCopy }) {
  const ticketWidth = 128;
  const ticketHeight = 28;
  const circleRadius = 3; // 9.3px diameter / 2

  return (
    <View style={styles.couponTicketContainer}>
      <Svg width={ticketWidth} height={ticketHeight} viewBox={`0 0 ${ticketWidth} ${ticketHeight}`}>
        {/* Main background rectangle */}
        <Rect
          x="0"
          y="0"
          width={ticketWidth}
          height={ticketHeight}
          fill="#00AEBD1C"
        />
        
        {/* Left circular cutout */}
        <Circle 
          cx="0" 
          cy={ticketHeight / 2} 
          r={ticketHeight/6} 
          fill="white" 
        />
        
        {/* Right circular cutout */}
        <Circle 
          cx={ticketWidth} 
          cy={ticketHeight / 2} 
          r={ticketHeight/6} 
          fill="white" 
        />
        
        {/* Dotted border */}
        <Path
          d={`M ${circleRadius},0
              H ${ticketWidth}
              V ${ticketHeight/3}
              A ${ticketHeight/6} ${ticketHeight/6} 0 0 0 ${ticketWidth} ${2*ticketHeight/3}
              V ${ticketHeight}
              H 0
              V ${2*ticketHeight/3}
              A ${ticketHeight/6} ${ticketHeight/6} 0 0 0 0 ${ticketHeight/3}
              V 0
              Z
            `}
          fill="none"
          stroke="#00AEBD"
          strokeWidth="1"
          strokeDasharray="1 2"
        />
      </Svg>
      
      {/* Content overlay */}
      <View style={[
        styles.couponContent,
        isAutoApplied ? styles.couponContentCentered : styles.couponContentSpaced
      ]}>
        <Text style={styles.couponCodeText}>
          {code}
        </Text>
        
        {!isAutoApplied && (
          <TouchableOpacity style={styles.copyButton} onPress={onCopy}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function OfferCard({ title, description, code }) {
// Check both "Auto Applied" and "Auto-applied" variations
  const isAutoApplied = code === "Auto Applied" || code === "Auto-applied";

  return (
    <View style={styles.offerCardContainer}>
      {/* Header */}
      <View style={styles.offerCardHeader}>
        <Text style={styles.offerCardHeaderText} numberOfLines={1}>
          {title}
        </Text>
      </View>
      
      {/* Body */}
      <View style={styles.offerCardBody}>
        <Text style={styles.offerCardDescription} numberOfLines={2}>
          {description}
        </Text>
        
        {/* Coupon ticket */}
        <CouponTicket 
          code={code} 
          isAutoApplied={isAutoApplied} 
          onCopy={() => console.log("Copied code:", code)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({  
  // New Offer Card styles
  offerCardContainer: {
    width: 144,
    height: 115,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    marginRight: 12,
  },
  offerCardHeader: {
    height: 33,
    backgroundColor: '#00AEBD',
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    zIndex: 1,
  },
  offerCardHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
  offerCardBody: {
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 8,
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 0,
    position: 'relative',
    top: -1,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  offerCardDescription: {
    fontSize: 12,
    color: '#454545',
    marginBottom: 6,
    lineHeight: 16,
  },
  
  // Coupon ticket styles
  couponTicketContainer: {
    height: 28,
    position: 'relative',
  },
  couponContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponContentSpaced: {
    justifyContent: 'space-between',
  },
  couponContentCentered: {
    justifyContent: 'center',
  },
  couponCodeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(69, 69, 69, 0.8)',
  },
  copyButton: {
    paddingHorizontal: 5,
  },
  copyButtonText: {
    fontSize: 12,
    color: '#00AEBD',
    fontWeight: 'bold',
  }
});