import Converter from "./Converter";
import MainBrandLogo from "./MainBrandLogo";

const App = () => {
  return (
    <div className="App">
      <MainBrandLogo
        logoSrc="/soft-logo.webp"
        mainDomain="soft.io.vn"
        dismissible={false}
        altText="Logo Soft"
      />
      <Converter />
    </div>
  );
};

export default App;
