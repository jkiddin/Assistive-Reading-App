import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from "./App";
import Dashboard from "./Dashboard";
import ErrorPage from './ErrorPage';
import Reader from './Reader';
import Login from './Login';
import CreateAccount from './CreateAccount';
import ProtectedRoute from './ProtectedRoute';
import ResetPassword from './resetPassword';
import ResetPasswordWithOTP from './resetPasswordOTP';

const Router = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <App></App>,
            errorElement: <ErrorPage></ErrorPage>

        },
        {
            path: "dashboard",
            element: <ProtectedRoute><Dashboard /></ProtectedRoute>
        },
        {
            path: "login",
            element: <Login></Login>
        },
        {
            path: "reader/:title",
            element: <Reader> </Reader>
        },
        {
            path: "create-account",
            element: <CreateAccount></CreateAccount>
        },
        {
            path: "reset-password",
            element: <ResetPassword></ResetPassword>
        },
        {
            path: "reset-password-verify",
            element: <ResetPasswordWithOTP></ResetPasswordWithOTP>
        }

    ]);
    return <RouterProvider 
    router = {router} 
    />
};
export default Router;
