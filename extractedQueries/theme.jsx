import {StyleSheet} from 'react-native';

export const colors = {
  white: '#ffffff',

  primary10: '#E6F7F9',
  primary20: '#CCEFF2',
  primary30: '#B3E7EC',
  primary40: '#99DFE5',
  primary50: '#7FD6DD',
  primary60: '#66CED7',
  primary70: '#4DC7D1',
  primary80: '#33BECA',
  primary90: '#1AB7C4',
  primaryMain: '#00AEBD',
  primaryDark: '#00909E',

  secondary10: '#E6F1F1',
  secondary20: '#CCE3E2',
  secondary30: '#B3D5D3',
  secondary40: '#99C7C4',
  secondary50: '#7FB8B5',
  secondary60: '#66AAA7',
  secondary70: '#4D9D99',
  secondary80: '#338E89',
  secondary90: '#1A817B',
  secondaryMain: '#00726C',

  savingsText: '#008000',
  buttonBg: '#FACA0C',
  accentCoral: '#F27B58',
  accentBurgundy: '#A90A42',

  dark5: '#FBFBFB',
  dark10: '#F3F3F3',
  dark20: '#D1D1D1',
  dark30: '#BBBBBB',
  dark40: '#A3A3A3',
  dark50: '#8C8C8C',
  dark60: '#767676',
  dark70: '#5F5F5F',
  dark80: '#484848',
  dark90: '#313131',
  dark100: '#1A1A1A',
};

export const gradients = {
  alphaPrimary16: {
    start: {color: '#ffffff', opacity: 1},
    end: {color: '#00AEBD', opacity: 0.16},
  },
  alphaPrimary10: {
    start: {color: '#ffffff', opacity: 1},
    end: {color: '#00aebd', opacity: 0.1}
  },
  alphaPrimary4: {
    start: {color: '#ffffff', opacity: 1},
    end: {color: '#00aebd', opacity: 0.04}
  },
  otherBgGradient: {
    start: {color: '#c5faff', opacity: 1},
    end: {color: '#37eeff', opacity: 1},
    bg: '#ffffff'
  }, 
  otherStroke: {
    start: '#000000',
    end: '#666666'
  }
};

export const typography = StyleSheet.create({
  family: {
    fontFamily: 'SF Pro Text',
    color: colors.dark100
  },
  heading20: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: -0.4
  },
  heading19: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 19,
    lineHeight: 19,
    color: colors.dark100
  },
  heading14: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.4,
    color: colors.dark100
  },
  price: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 18,
    letterSpacing: -0.4,
    color: colors.dark100
  },
  slashedPrice: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: -0.4,
    textDecorationLine: 'line-through',
    color: colors.dark50
  },
  savings: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 13,
    letterSpacing: -0.4,
    color: colors.savingsText
  },
  subHeading15: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 15,
    lineHeight: 15,
    color: colors.dark100
  },
  subHeading14: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: colors.dark80
  },
  subHeading12: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.4,
    color: colors.dark100
  },
  body14: {
    fontFamily: 'SF Pro Text',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    color: colors.dark80
  },
  bestseller: {
    fontFamily: 'SF Pro Text',
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 11,
    letterSpacing: 0.4,
    color: colors.accentCoral
  }
});