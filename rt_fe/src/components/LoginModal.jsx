import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { HOST } from '../api';

const LoginModal = ({ toggleModal, onSuccessfulLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);

    const toggleMode = () => {
        setErrorMessage('');
        setIsLoginMode(!isLoginMode);
        setConfirmPassword('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isLoginMode && password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        const url = `${HOST}/book/${isLoginMode ? 'loginUser' : 'registerUser'}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
             });

            const data = await response.json();

            if (response.ok && isLoginMode) {
                Cookies.set('token', data.user.token);
                onSuccessfulLogin();
                toggleModal();
            } else if (response.ok && !isLoginMode) {
                alert('Registration successful! You can now log in using the provided credentials.');
                setIsLoginMode(true);
            } else {
                setErrorMessage(data.message || (isLoginMode ? 'Failed to login' : 'Failed to register'));
            }
        } catch (error) {
            setErrorMessage(isLoginMode ? 'Failed to login' : 'Failed to register');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
            <div className="bg-white p-5 rounded-lg">
                <h2 className="text-lg font-bold mb-2 text-center">{isLoginMode ? 'Login' : 'New Account Registration'}</h2>
                {errorMessage && <p className="text-red-500 mb-2 text-center">{errorMessage}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border p-2 rounded w-full mb-2"
                    />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 rounded w-full mb-2"
                    />
                    {!isLoginMode && (
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="border p-2 rounded w-full mb-2"
                        />
                    )}
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                            className="mr-2"
                        />
                        <label>Show Password</label>
                    </div>
                    <div className="flex justify-between items-center">
                        <a href="#!" onClick={toggleMode} className="text-blue-600 hover:text-blue-800">
                            {isLoginMode ? 'New User?' : 'Existing User?'}
                        </a>
                        <div>
                            <button
                                type="button"
                                onClick={toggleModal}
                                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {isLoginMode ? 'Login' : 'Register'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginModal;
