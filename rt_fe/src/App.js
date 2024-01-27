import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Home from './pages/Home';
import BookList from './pages/BookList';
import AddBook from './pages/AddBook';
import BookDetails from './pages/BookDetails';
import UpdateProgress from './pages/UpdateProgress';

function App() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/booklist',
      element: <BookList />,
    },
    {
      path: '/addbook',
      element: <AddBook />,
    },
    {
      path: '/book/:bookId',
      element: <BookDetails />,
    },
    {
      path: '/update-progress/:bookId',
      element: <UpdateProgress />,
    },
    
  ]);

  return <RouterProvider router={router} />;
}

export default App;
