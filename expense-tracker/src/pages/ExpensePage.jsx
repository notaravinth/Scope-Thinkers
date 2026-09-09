import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ExpensePage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [expenseAmount, setExpenseAmount] = useState(0);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [remainingBudget, setRemainingBudget] = useState(location.state.budget);

    return (
        <div className='mt-5 '>

            <button
                onClick={() => navigate('/')}
                className='bg-blue-500 text-white rounded-lg p-2 m-2 w-60 h-15 cursor-pointer hover:bg-blue-700'
            >
                Back to Home
            </button>

            <h1 className='text-blue-500 text-center text-4xl font-bold'>
                Expense Page
            </h1>

            <p className='text-center text-2xl mt-5 text-white'>
                Remaining Budget: ₹{remainingBudget}
            </p>

            <form
                className='flex flex-col items-center'
                onSubmit={(e) => {
                    e.preventDefault();

                    if (expenseAmount <= 0 || expenseDescription === '') {
                        alert('Please enter a valid expense amount and description.');
                        return;
                    }

                    if (remainingBudget - expenseAmount < 0) {
                        alert('You have exceeded your budget!');
                        return;
                    }
                

                    const newExpense = {
                        amount: expenseAmount,
                        description: expenseDescription
                    };

                    setExpenses([...expenses, newExpense]);
                    setRemainingBudget(remainingBudget - expenseAmount);

                    setExpenseAmount(0);
                    setExpenseDescription('');
                }}
            >
                <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    placeholder='Enter your expense'
                    className='border-2 border-white rounded-lg p-2 m-2 w-90 h-15 text-center text-2xl text-white'
                />

                <input
                    type="text"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
                    placeholder='Enter your expense description'
                    className='border-2 border-white rounded-lg p-2 m-2 w-90 h-15 text-center text-2xl text-white'
                />

                <button
                    type="submit"
                    className='bg-blue-500 text-white p-2 m-2 w-90 h-15 text-center text-2xl rounded-lg cursor-pointer hover:bg-blue-700'
                >
                    Add Expense
                </button>
            </form>

            <h2 className='text-3xl text-center mt-10 text-blue-500 font-bold'>
                Expenses
            </h2>

            <div className='items-center mt-5 flex flex-row flex-wrap text-center justify-center'>

                {expenses.map((expense, index) => (
                    <div key={index} className='flex flex-col items-center border-2 border-white rounded-lg p-2 m-2 w-90 text-center text-2xl mt-5 mb-5 text-white'>
                        <p className='text-xxl mb-2'>
                            Amount: ₹{expense.amount}
                        </p>

                        <p className='text-xl mb-2'>
                            Description: {expense.description}
                        </p>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default ExpensePage;