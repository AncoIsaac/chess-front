import style from "./style/Login.module.css";
import FormLogin from "../../components/form/FormLogin";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <section className={style.container}>
        <FormLogin />
      </section>
    </div>
  );
};

export default Login;