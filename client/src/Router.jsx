import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from "./App";
import Dashboard from "./Dashboard";
import ErrorPage from './ErrorPage';

const Router = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <App></App>,
            errorElement: <ErrorPage></ErrorPage>

        },
        {
            path: "dashboard",
            element: <Dashboard></Dashboard>
        },
        {
            path: "login",
        },
        {
            path: "read",
        }
    ]);
    return <RouterProvider router = {router} />
};
export default Router;
