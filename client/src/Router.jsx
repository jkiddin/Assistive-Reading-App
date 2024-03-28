import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from "./App";
import Dashboard from "./Dashboard";

const Router = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <App></App>
        },
        {
            path: "dashboard",
            element: <Dashboard></Dashboard>
        },
        {
            path: "login",
        },
        {
            path: "read"
        }
    ]);
    return <RouterProvider router = {router} />
};
export default Router;
