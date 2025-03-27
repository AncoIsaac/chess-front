// import FormCreate from "../../components/form/FormCreate";
import FormLogin from "../../components/form/FormLogin";
import style from "./style/Login.module.css";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <section className={style.container}>
        <FormLogin />
        {/* <FormCreate/> */}
      </section>
    </div>
  );
};

export default Login;