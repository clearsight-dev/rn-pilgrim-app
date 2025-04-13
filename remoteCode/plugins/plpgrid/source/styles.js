import { StyleSheet } from 'react-native';
import { colors, FONT_FAMILY } from '../../../../extractedQueries/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsCount: {
    fontSize: 16,
    color: colors.dark70,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    fontSize: 14,
    marginLeft: 8,
  },
  gridContainer: {
    paddingBottom: 80, // Add padding to account for bottom buttons
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    marginRight: 0,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
    color: colors.dark70,
  },
  filterValueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark20,
  },
  selectedFilterValue: {
    backgroundColor: colors.dark5,
  },
  filterValueText: {
    fontSize: 16,
    color: colors.dark10,
  },
  selectedFilterValueText: {
    fontFamily: FONT_FAMILY.bold,
    fontWeight: '600',
    color: '#000',
  },
  checkIcon: {
    fontSize: 20,
    color: colors.secondaryMain,
  },
});

export default styles;
