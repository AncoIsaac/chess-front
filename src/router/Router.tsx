import { createBrowserRouter, RouterProvider } from "react-router"
import HomeLayout from "../page/HomeLayout"
import Login from "../page/Login/Login"
import HomePageLayout from "../page/Home/HomePageLayout"

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
      {
        path: 'home',
        element: <HomePageLayout/>,
      }
    ]
  }, 
])

const Router = () => {
  return (
    <RouterProvider router={routerDom} />
  )
}

export default Router