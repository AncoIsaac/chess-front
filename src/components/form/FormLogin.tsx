import { useState } from "react";
import style from "./style/form.module.css";
import { LoginI } from "../../interface/Login/LoginI";
import { usePost } from "../../server/hook/usePost";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router";

const loginSchema = z.object({
  email: z.string().email("El email es invalido").min(1, "Email es requerido"),
  password: z.string()
});

type LoginFormData = z.infer<typeof loginSchema>;

const FormLogin = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { trigger } = usePost<LoginI, any>("auth/login");
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema), 
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await trigger(data);
      localStorage.setItem("idUser", response.data.id);
      toast.success(response.message);
      navigate('/home')
    } catch (error: any) {
      toast.error(String(error?.response.data?.message));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1 className="flex justify-center pb-11">Inicio de seccion</h1>
      <div className="flex flex-col mb-6">
        <label>Email <span className="text-red-500">*</span></label>
        <input
          {...register("email")}
          type="email"
          className={style.input}
          placeholder="ejemplo@gmail.com"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className={style.passwordContainer}>
        <label>Password <span className="text-red-500">*</span></label>
        <input
          {...register("password")}
          type={showPassword ? "text" : "password"}
          className={style.passwordInput}
          placeholder="••••••••"
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
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>
      <button className={style.button} type="submit">
        Iniciar Sesión
      </button>
    </form>
  );
};

export default FormLogin;
