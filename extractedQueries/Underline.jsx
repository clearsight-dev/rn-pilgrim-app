import Svg, {Path} from 'react-native-svg';

const Underline = props => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.style?.width || 115}
    height={props.style?.height || 26}
    fill="none"
    {...props}>
    <Path
      stroke="#009FAD"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={3}
      d="M109.5 10.246C84 7.08 28 2.046 8 7.246c36.8.4 65.333 9.167 75 13.5"
    />
  </Svg>
);

export default Underline;
