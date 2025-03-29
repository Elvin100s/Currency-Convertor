const API_KEY = '';
const BASE_URL = 'https://api.exchangeratesapi.io/v1';

// Elements
const amountInput = document.getElementById('amount');
const fromSelect = document.getElementById('from');
const toSelect = document.getElementById('to');
const convertBtn = document.getElementById('convert');
const swapBtn = document.getElementById('swap');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

// Common currencies with RWF added
const commonCurrencies = {
    RWF: 'Rwandan Franc',
    USD: 'United States Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    KES: 'Kenyan Shilling',
    UGX: 'Ugandan Shilling',
    TZS: 'Tanzanian Shilling',
    BIF: 'Burundian Franc',
    CNY: 'Chinese Yuan',
    AED: 'UAE Dirham'
};

// Initialize currency dropdowns
function initializeCurrencyDropdowns() {
    Object.keys(commonCurrencies).forEach(currency => {
        const option1 = new Option(`${currency} - ${commonCurrencies[currency]}`, currency);
        const option2 = new Option(`${currency} - ${commonCurrencies[currency]}`, currency);
        
        fromSelect.add(option1);
        toSelect.add(option2);
    });

    // Set default values
    fromSelect.value = 'RWF';
    toSelect.value = 'USD';
}

// Format number with commas
function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

// Convert currency
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromSelect.value;
    const toCurrency = toSelect.value;

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    try {
        loader.style.display = 'block';
        convertBtn.disabled = true;
        convertBtn.textContent = 'Converting...';
        resultDiv.classList.remove('error');

        const response = await fetch(`${BASE_URL}/latest?access_key=${API_KEY}&base=EUR&symbols=${fromCurrency},${toCurrency}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.info || 'Failed to fetch exchange rates');
        }

        if (data.success && data.rates) {
            const eurToFrom = data.rates[fromCurrency];
            const eurToTo = data.rates[toCurrency];
            
            if (!eurToFrom || !eurToTo) {
                throw new Error('Exchange rate not available for selected currencies');
            }

            // Calculate conversion
            const amountInEur = amount / eurToFrom;
            const finalAmount = amountInEur * eurToTo;
            
            const rate = eurToTo / eurToFrom;
            const formattedAmount = formatNumber(amount);
            const formattedResult = formatNumber(finalAmount.toFixed(2));
            
            resultDiv.innerHTML = `
                <div class="conversion-result">
                    <span class="amount">${formattedAmount} ${fromCurrency}</span>
                    <span class="equals">=</span>
                    <span class="converted">${formattedResult} ${toCurrency}</span>
                </div>
                <div class="rate">1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}</div>
            `;
        } else {
            throw new Error(data.error?.info || 'Failed to convert currency');
        }
    } catch (error) {
        console.error('Conversion error:', error);
        resultDiv.classList.add('error');
        resultDiv.innerHTML = `
            <div class="error-message">
                Error: ${error.message || 'Unable to fetch exchange rates. Please try again later.'}
            </div>
        `;
    } finally {
        loader.style.display = 'none';
        convertBtn.disabled = false;
        convertBtn.textContent = 'Convert';
    }
}

// Swap currencies
function swapCurrencies() {
    const temp = fromSelect.value;
    fromSelect.value = toSelect.value;
    toSelect.value = temp;
    convertCurrency();
}

// Event listeners
convertBtn.addEventListener('click', convertCurrency);
swapBtn.addEventListener('click', swapCurrencies);
amountInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') convertCurrency();
});

// Initialize the app
initializeCurrencyDropdowns();
convertCurrency(); // Initial conversion
