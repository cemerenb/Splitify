import * as React from "react";
import Svg, {
  Defs,
  LinearGradient,
  Stop,
  G,
  Image,
  Path,
} from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: metadata */
const SVGComponent = (props) => (
  <Svg
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    id="svg36626"
    viewBox="0 0 1024 768"
    height="768px"
    width="1024px"
    {...props}
  >
    <Defs id="defs36630" />
    <LinearGradient
      spreadMethod="pad"
      y2="30%"
      x2="-10%"
      y1="120%"
      x1="30%"
      id="3d_gradient2-logo-34840208-f495-4083-a6c0-4988fd72345c"
    >
      <Stop id="stop36607" stopOpacity={1} stopColor="#ffffff" offset="0%" />
      <Stop id="stop36609" stopOpacity={1} stopColor="#000000" offset="100%" />
    </LinearGradient>
    <LinearGradient
      gradientTransform="rotate(-30)"
      spreadMethod="pad"
      y2="30%"
      x2="-10%"
      y1="120%"
      x1="30%"
      id="3d_gradient3-logo-34840208-f495-4083-a6c0-4988fd72345c"
    >
      <Stop id="stop36612" stopOpacity={1} stopColor="#ffffff" offset="0%" />
      <Stop id="stop36614" stopOpacity={1} stopColor="#cccccc" offset="50%" />
      <Stop id="stop36616" stopOpacity={1} stopColor="#000000" offset="100%" />
    </LinearGradient>
    <G id="logo-group">
      <Image
        xlinkHref=""
        id="container"
        x={272}
        y={144}
        width={480}
        height={480}
        transform="translate(0 0)"
        style={{
          display: "none",
        }}
      />
      <G id="logo-center" transform="translate(0 0)">
        <Image
          xlinkHref=""
          id="icon_container"
          x={0}
          y={0}
          style={{
            display: "none",
          }}
        />
        <G
          id="slogan"
          style={{
            fontStyle: "normal",
            fontWeight: 600,
            fontSize: 32,
            lineHeight: 1,
            fontFamily: "Karma",
            fontVariantLigatures: "none",
            textAlign: "center",
            textAnchor: "middle",
          }}
          transform="translate(0 0)"
        />
        <G
          id="title"
          style={{
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: 72,
            lineHeight: 1,
            fontFamily: "antre",
            fontVariantLigatures: "none",
            textAlign: "center",
            textAnchor: "middle",
          }}
          transform="translate(0 0)"
        >
          <Path
            id="path36635"
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 72,
              lineHeight: 1,
              fontFamily: "antre",
              fontVariantLigatures: "none",
              textAlign: "center",
              textAnchor: "middle",
            }}
            d="m 429.98412,0.576 c 2.88,0 5.688,-0.504 9.072,-2.52 3.024,-1.944 6.26401,-5.112 11.16,-10.656 l 7.20001,-8.568 c 1.07999,-1.296 1.00799,-3.168 -0.28801,-4.32 -1.29599,-1.08 -3.312,-0.936 -4.39199,0.36 l -7.05601,8.352 -3.16799,3.6 c -0.288,-2.376 -1.29601,-4.968 -4.17601,-9.864 -1.008,-1.8 -3.024,-4.68 -3.31199,-6.192 -0.072,-0.432 -0.216,-1.224 1.07999,-2.736 1.152,-1.296 0.936,-3.24 -0.36,-4.392 -1.152,-1.008 -3.24,-0.936 -4.248,0.288 l -16.344,19.44 c -1.07999,1.296 -1.008,3.312 0.36001,4.392 1.296,1.152 3.16799,0.936 4.32,-0.432 l 10.29599,-12.24 c 0.504,1.08 1.08,2.16 2.88,5.04 3.096,5.256 3.38401,6.696 3.38401,8.352 0,1.44 -0.64801,2.88 -1.728,3.96 -0.79201,0.792 -2.16001,1.944 -4.68001,1.944 -2.304,0 -4.24799,-1.08 -4.824,-1.584 -1.368,-1.08 -3.312,-0.792 -4.32,0.576 -1.07999,1.368 -0.79199,3.312 0.50401,4.32 1.368,1.08 5.03999,2.88 8.63999,2.88 z"
            strokeWidth={0}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            fill="#b41871"
            stroke="#b41871"
            transform="translate(0 310.74805785999996) translate(348.41535958500015 42.31470784000001) scale(1.67) translate(-414.40697 37.058448)"
          />
          <Path
            id="path36637"
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 72,
              lineHeight: 1,
              fontFamily: "antre",
              fontVariantLigatures: "none",
              textAlign: "center",
              textAnchor: "middle",
            }}
            d="m 448.33175,17.136 c 1.368,0 2.592,-0.864 2.952,-2.232 0,-0.072 0.864,-3.312 5.184,-18.576 2.52,3.096 6.84,4.176 10.512,4.176 7.416,0 14.256,-2.592 23.184,-12.384 l 8.136,-9.72 c 1.08,-1.296 0.936,-3.168 -0.36,-4.248 -1.296,-1.152 -3.24,-0.936 -4.392,0.36 l -7.992,9.504 c -1.584,1.8 -2.88,3.24 -4.176,4.392 l 0.648,-2.088 c 0.864,-3.096 1.224,-4.32 1.8,-6.624 0.648,-2.376 0.864,-4.608 0.648,-6.696 -0.288,-2.376 -1.08,-4.392 -2.376,-6.12 -1.584,-2.016 -4.68,-4.464 -10.368,-4.464 -1.944,0 -4.608,0.432 -7.416,2.016 -0.36,-0.648 -1.008,-1.152 -1.728,-1.368 -1.656,-0.504 -3.384,0.432 -3.888,2.088 -0.648,2.088 -2.736,5.904 -5.472,9.216 l -7.92,9.432 c -1.08,1.368 -0.936,3.312 0.432,4.392 0.576,0.432 1.224,0.72 1.944,0.72 0.864,0 1.872,-0.576 2.448,-1.296 l 3.456,-4.104 c -7.2,26.064 -8.28,29.664 -8.28,29.736 -0.432,1.656 0.504,3.312 2.16,3.816 0.288,0.072 0.576,0.072 0.864,0.072 z m 23.4,-48.528 c 2.52,0 4.392,0.72 5.472,2.088 1.224,1.656 1.512,4.32 0.648,7.344 -0.576,2.376 -0.936,3.528 -1.728,6.336 -1.296,4.68 -3.528,10.008 -9.36,10.008 -5.904,0 -8.496,-4.68 -6.552,-11.376 0.36,-1.224 0.72,-2.808 1.296,-4.536 1.008,-3.6 2.592,-6.264 4.752,-7.92 2.088,-1.584 4.104,-1.944 5.472,-1.944 z"
            strokeWidth={0}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            fill="#b41871"
            stroke="#b41871"
            transform="translate(0 310.74805785999996) translate(398.82609648500005 41.437036) scale(1.67) translate(-444.59304 37.584)"
          />
          <Path
            id="path36639"
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 72,
              lineHeight: 1,
              fontFamily: "antre",
              fontVariantLigatures: "none",
              textAlign: "center",
              textAnchor: "middle",
            }}
            d="m 519.14375,-24.48 c -1.296,-1.152 -3.528,-0.72 -4.608,0.576 l -10.44,12.312 c -1.008,1.224 -2.736,3.24 -3.888,3.888 l 11.808,-42.552 c 0.432,-1.656 -0.504,-3.384 -2.16,-3.816 -1.656,-0.504 -3.384,0.504 -3.816,2.16 -1.08,4.032 -2.232,7.848 -3.384,12.024 -1.44,5.256 -4.608,9.288 -7.344,12.384 l -7.344,8.712 c -1.152,1.296 -1.152,3.456 0.144,4.536 0.576,0.504 1.296,0.72 2.016,0.72 0.864,0 1.872,-0.432 2.52,-1.224 l 4.68,-5.616 -3.384,12.096 c -0.288,1.152 -0.792,3.384 -0.36,5.112 0.432,1.728 2.304,3.168 3.816,3.168 3.168,0 6.768,-2.304 9.36,-5.256 2.376,-2.664 12.312,-14.544 12.384,-14.616 1.224,-1.368 1.296,-3.528 0,-4.608 z"
            strokeWidth={0}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            fill="#b41871"
            stroke="#b41871"
            transform="translate(0 310.74805785999996) translate(469.8477228850001 13.684448280000005) scale(1.67) translate(-487.12096 54.202316)"
          />
          <Path
            id="path36641"
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 72,
              lineHeight: 1,
              fontFamily: "antre",
              fontVariantLigatures: "none",
              textAlign: "center",
              textAnchor: "middle",
            }}
            d="m 516.3065,-6.696 c -0.144,0.576 -0.288,1.656 -0.288,2.232 0,2.376 1.8,5.04 5.616,5.04 4.896,0 7.848,-3.24 11.52,-7.632 l 9.72,-11.592 c 1.08,-1.296 1.152,-3.384 -0.144,-4.464 -1.296,-1.152 -3.456,-0.864 -4.536,0.504 l -10.728,12.744 c -1.368,1.584 -3.168,4.032 -4.896,4.032 l 7.344,-26.712 c 0.216,-0.864 0.288,-1.296 0.288,-1.584 0,-1.584 -1.368,-2.952 -3.168,-2.952 -0.864,0 -1.8,0.36 -2.376,1.08 l -15.768,18.72 c -1.08,1.296 -0.936,3.384 0.36,4.392 1.296,1.008 3.096,1.008 4.248,-0.288 l 6.768,-8.064 c -1.8,6.552 -3.96,14.544 -3.96,14.544 z m 13.896,-35.856 c 2.232,0 4.104,-1.872 4.104,-4.104 0,-2.304 -1.872,-4.104 -4.104,-4.104 -2.304,0 -4.104,1.8 -4.104,4.104 0,2.232 1.8,4.104 4.104,4.104 z"
            strokeWidth={0}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            fill="#b41871"
            stroke="#b41871"
            transform="translate(0 310.74805785999996) translate(504.998767985 19.433116000000005) scale(1.67) translate(-508.16949 50.76)"
          />
          <Path
            id="path36643"
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 72,
              lineHeight: 1,
              fontFamily: "antre",
              fontVariantLigatures: "none",
              textAlign: "center",
              textAnchor: "middle",
            }}
            d="m 560.7845,-31.464 c 1.728,0 3.096,-1.368 3.096,-3.096 0,-1.656 -1.368,-3.096 -3.096,-3.096 h -5.328 l 1.728,-6.264 c 0.504,-1.656 -0.504,-3.312 -2.16,-3.816 -1.656,-0.432 -3.312,0.576 -3.816,2.16 l -2.088,7.56 c -1.296,3.816 -2.736,5.616 -7.272,11.016 l -8.424,10.008 c -1.08,1.296 -1.008,3.24 0.288,4.392 0.576,0.504 1.296,0.72 2.016,0.72 0.864,0 1.728,-0.36 2.376,-1.08 l 6.12,-7.272 -2.664,9.792 c -0.792,2.808 -0.288,5.616 1.296,7.776 1.512,2.016 3.888,3.168 6.48,3.168 4.032,0 6.48,-2.664 8.208,-4.608 l 13.248,-15.768 c 1.08,-1.296 1.008,-3.24 -0.288,-4.392 -1.296,-1.08 -3.24,-0.864 -4.392,0.432 l -13.464,15.984 c -1.224,1.368 -2.232,2.16 -3.312,2.16 -0.648,0 -1.152,-0.288 -1.512,-0.72 -0.432,-0.576 -0.576,-1.44 -0.288,-2.376 l 6.192,-22.68 z"
            strokeWidth={0}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            fill="#b41871"
            stroke="#b41871"
            transform="translate(0 310.74805785999996) translate(545.9185942849999 24.315639890000007) scale(1.67) translate(-532.67238 47.836333)"
          />
          <Path
            id="path36645"
            style={{
              fontStyle: "normal",
              fontWeight: "normal",
              fontSize: 72,
              lineHeight: 1,
              fontFamily: "antre",
              fontVariantLigatures: "none",
              textAlign: "center",
              textAnchor: "middle",
            }}
            d="m 609.31587,-22.176 c -1.296,-1.152 -3.096,-1.296 -4.248,0.072 l -5.256,6.264 c -7.34399,8.424 -12.24,10.224 -17.928,10.224 -3.528,0 -6.12,-0.936 -7.41599,-2.736 -1.08001,-1.44 -1.36801,-3.456 -0.936,-5.76 h 6.624 c 4.75199,0 8.424,-0.792 11.23199,-2.376 2.88,-1.656 4.824,-4.32 5.904,-7.848 0.43201,-1.656 0.57601,-3.312 0.28801,-4.896 -0.72001,-5.328 -5.904,-8.424 -10.80001,-8.424 -2.88,0 -5.688,0.432 -8.28,1.8 -2.736,1.368 -5.472,3.744 -8.568,7.416 l -10.008,11.88 c -1.15199,1.296 -1.15199,3.312 0.144,4.464 0.576,0.504 1.296,0.72 2.01601,0.72 0.86399,0 1.72799,-0.288 2.37599,-1.008 l 3.24001,-3.888 c -1.15201,4.392 -0.50401,8.568 1.79999,11.664 1.80001,2.376 5.328,5.184 12.384,5.184 4.24801,0 7.77601,-0.864 11.232,-2.664 3.816,-1.944 7.056,-4.824 11.08801,-9.432 l 5.328,-6.336 c 1.08,-1.296 1.08,-3.168 -0.21601,-4.32 z m -18,-3.888 c -0.432,2.016 -1.512,3.312 -3.024,4.176 -1.79999,1.08 -4.464,1.584 -8.13599,1.584 h -4.89601 c 0.072,-0.432 0.216,-0.936 0.36,-1.44 1.65601,-5.76 5.328,-9.72 10.87201,-9.72 3.38399,0 5.544,2.232 4.82399,5.4 z"
            strokeWidth={0}
            strokeLinejoin="miter"
            strokeMiterlimit={2}
            fill="#b41871"
            stroke="#b41871"
            transform="translate(0 310.74805785999996) translate(590.0144432849999 41.31679600000001) scale(1.67) translate(-559.07708 37.656)"
          />
        </G>
        <Image
          xlinkHref=""
          id="icon"
          x={0}
          y={0}
          style={{
            display: "none",
          }}
        />
      </G>
    </G>
  </Svg>
);
export default SVGComponent;
