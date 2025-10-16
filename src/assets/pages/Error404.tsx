
import errorimg from "../images/error.png"

export default function Error404() {
  return (
    <div style={{
      display: "flex",
      justifyContent:"center",
     
    }}>
      <h1>Page not Found</h1>
      <img src={errorimg} alt="Error image" />
    </div>
  );
}
