import { useState } from "react";
import { CreateUserI } from "../../interface/user/CreateUserI";
import style from "./style/form.module.css";
import { usePost } from "../../server/hook/usePost";

const FormCreate = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [dataSend, setDataSend] = useState<CreateUserI>({
    userName: "",
    email: "",
    password: "",
  });

  const { trigger } = usePost<CreateUserI, any>("Users");

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { width: "0%", color: "#e5e7eb" };
    if (pass.length < 5) return { width: "30%", color: "#ef4444" };
    if (pass.length < 8) return { width: "60%", color: "#f59e0b" };
    return { width: "100%", color: "#10b981" };
  };

  const strength = getPasswordStrength(dataSend.password);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDataSend((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="flex justify-center pb-11">Crear usuario</h1>

      <div className="flex flex-col mb-6">
        <label>
          Nombre de usuario <span className="text-red-500">*</span>
        </label>
        <input
          className={style.input}
          placeholder="Nombre de usuario"
          autoComplete="on"
          name="userName"
          onChange={handleChange}
          value={dataSend.userName}
        />
      </div>
      <div className="flex flex-col mb-6">
        <label>
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          className={style.input}
          placeholder="ejemplo@gmail.com"
          autoComplete="on"
          name="email"
          onChange={handleChange}
          value={dataSend.email}
        />
      </div>

      <div className={style.passwordContainer}>
        <label>
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type={showPassword ? "text" : "password"}
          className={style.passwordInput}
          placeholder="••••••••"
          value={dataSend.password}
          name="password"
          onChange={handleChange}
          autoComplete="current-password"
        />
        <span
          className={style.togglePassword}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </span>
        <div className={style.passwordStrength}>
          <div
            className={style.strengthIndicator}
            style={{ width: strength.width, background: strength.color }}
          ></div>
        </div>
      </div>

      <button className={style.button} type="submit">
        Iniciar Sesión
      </button>
    </form>
  );
};

export default FormCreate;
