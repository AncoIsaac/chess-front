import FormLogin from "../../components/form/FormLogin";
import style from "./style/login.module.css";

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
