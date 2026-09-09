import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

function ExpenseForm() {
    const navigate = useNavigate();

    const [budget, setBudget] = useState(0);

    return (
        <>
            <div>
                <h1 className='text-blue-500 text-center text-4xl font-bold mt-5'>
                    Expense Form
                </h1>
            </div>

            <div className='flex flex-col items-center justify-center mt-5'>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        navigate('/expenses',
                            {state:{
                            budget:budget
                        }});
                    }}
                    className='flex flex-col items-center bo'
                >
                    <input
                        value={budget}
                        onChange={(e) => {
                            setBudget(e.target.value);
                        }}
                        type="number"
                        placeholder="Enter this months budget"
                        className='border-2 border-white rounded-lg p-2 m-2 w-90 h-15 text-center text-2xl text-white'
                    />

                    <button
                        type="submit"
                        className='bg-blue-500 text-white rounded-lg p-2 m-2 w-60 h-15 cursor-pointer hover:bg-blue-700'
                    >
                        Submit Budget
                    </button>
                </form>
            </div>
        </>
    );
}

export default ExpenseForm;