import { createBrowserRouter, RouterProvider } from "react-router"
import HomeLayout from "../page/HomeLayout"
import Login from "../page/Login/Login"

const routerDom = createBrowserRouter([
  {
    path: "/",
    element: <HomeLayout />,
    errorElement: <div>Error</div>,
    children: [
      {
        index: true,
        element: <Login/>,
      }, 
    ]
  }, 
])

const Router = () => {
  return (
    <RouterProvider router={routerDom} />
  )
}

export default Router