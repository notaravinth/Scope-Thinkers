import {useState} from 'react';

function ExpenseForm() {

    const [budget, setBudget] = useState(0);
    const [submittedBudget, setSubmittedBudget] = useState(0);

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
                        setSubmittedBudget(budget);
                    }}
                    className='flex flex-col items-center'
                >
                    <input
                        value={budget}
                        onChange={(e) => {
                            setBudget(e.target.value);
                        }}
                        type="number"
                        placeholder="Enter this months budget"
                        className='border-2 border-black rounded-lg p-2 m-2 w-90 h-15 text-center text-2xl'
                    />

                    <button
                        type="submit"
                        className='bg-blue-500 text-white rounded-lg p-2 m-2 w-60 h-15 cursor-pointer hover:bg-blue-700'
                    >
                        Submit Budget
                    </button>
                </form>

                <p className='text-2xl mt-5'>
                    Monthly Budget: ₹{submittedBudget}
                </p>

            </div>
        </>
    );
}

export default ExpenseForm;