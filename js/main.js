document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const weightInput = document.getElementById('weight');
    const ferritinInput = document.getElementById('ferritin');
    const tdtRadio = document.getElementById('tdt');
    const drugTabs = document.querySelectorAll('.tab-button');
    const deferoxamineBrandGroup = document.getElementById('deferoxamine-brand-group');
    const deferoxamineBrandSelect = document.getElementById('deferoxamine-brand');
    const ferritinFeedback = document.getElementById('ferritin-feedback');
    
    const resultSection = document.getElementById('result-section');
    const doseText = document.getElementById('dose-text');
    const dosePerKgText = document.getElementById('dose-per-kg-text');
    const doseDetails = document.getElementById('dose-details');
    const suggestionBox = document.getElementById('suggestion-box');
    const suggestionText = document.getElementById('suggestion-text');
    const warningMessages = document.getElementById('warning-messages');

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const quoteElement = document.getElementById('motivational-quote');

    // --- App State ---
    let currentDrug = 'deferoxamine';

    // --- Data ---
    const motivationalQuotes = [
        "تو قوی‌تر از چیزی هستی که فکر می‌کنی.",
        "هر روز یک قدم، حتی کوچک، به سمت سلامتی بردار.",
        "قهرمان واقعی، تویی که با شجاعت زندگی می‌کنی.",
        "امید، قدرتمندترین داروی جهان است.",
        "فردای تو، روشن‌تر از امروز خواهد بود.",
        "لبخند بزن، تو الهام‌بخش دیگران هستی."
    ];

    // --- Functions ---

    /** Dark Mode Handler */
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        darkModeToggle.checked = theme === 'dark';
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(newTheme);
    };

    /** Display a random motivational quote */
    const showRandomQuote = () => {
        const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
        quoteElement.textContent = motivationalQuotes[randomIndex];
    };
    
    /** Main calculation orchestrator */
    const calculateAndDisplay = () => {
        const weight = parseFloat(weightInput.value);
        const ferritin = parseFloat(ferritinInput.value);
        const isTDT = tdtRadio.checked;

        // Clear previous results
        resultSection.classList.add('hidden');
        ferritinFeedback.classList.add('hidden');
        suggestionBox.classList.add('hidden');
        warningMessages.innerHTML = '';
        ferritinFeedback.innerHTML = '';


        if (!weight || weight <= 0) {
            return;
        }

        // Show ferritin feedback
        if (ferritin) {
            ferritinFeedback.classList.remove('hidden');
            if (ferritin < 1000) {
                ferritinFeedback.className = 'ferritin-feedback good';
                ferritinFeedback.innerHTML = '<strong>عالیه!</strong> سطح فریتین شما در محدوده هدف و ایده‌آل قرار دارد. به همین مسیر خوب ادامه بده.';
            } else if (ferritin >= 2500 && ferritin < 4000) {
                ferritinFeedback.className = 'ferritin-feedback high';
                ferritinFeedback.innerHTML = '<strong>توجه:</strong> سطح فریتین شما بالاست. نگران نباشید، با درمان منظم کاهش پیدا می‌کند. حتماً در مورد دوز و برنامه درمانی خود با پزشک‌تان مشورت کنید.';
            } else if (ferritin >= 4000) {
                 ferritinFeedback.className = 'ferritin-feedback very-high';
                ferritinFeedback.innerHTML = '<strong>هشدار جدی:</strong> سطح فریتین شما بسیار بالاست. لطفاً در اسرع وقت با پزشک خود مشورت کنید. ممکن است نیاز به درمان ترکیبی (مثلا دو دارو همزمان) یا اقدامات دیگر داشته باشید.';
            } else {
                 ferritinFeedback.classList.add('hidden');
            }
        }
        
        resultSection.classList.remove('hidden');

        if (weight < 8 && (currentDrug === 'deferiprone' || currentDrug === 'deferasirox')) {
             addWarning('مصرف این دارو در کودکان با سن یا وزن پایین، باید با احتیاط و حتما تحت نظر پزشک متخصص باشد.', 'warning');
        }

        switch (currentDrug) {
            case 'deferoxamine':
                calculateDeferoxamine(weight, ferritin, isTDT);
                break;
            case 'deferasirox':
                calculateDeferasirox(weight, ferritin, isTDT);
                break;
            case 'deferiprone':
                calculateDeferiprone(weight, ferritin, isTDT);
                break;
        }
    };
    
    /** Deferoxamine Calculation (REWRITTEN & SMARTER) */
    const calculateDeferoxamine = (weight, ferritin, isTDT) => {
        let baseDosePerKg = isTDT ? 40 : 25;
        let finalDosePerKg = baseDosePerKg;

        if (ferritin) {
            if (ferritin > 2500) {
                finalDosePerKg = Math.min(baseDosePerKg * 1.20, 60);
            } else if (ferritin < 1000 && isTDT) {
                finalDosePerKg = Math.max(baseDosePerKg * 0.80, 20);
            }
        }
        
        finalDosePerKg = Math.round(finalDosePerKg);
        const totalDose = Math.round(weight * finalDosePerKg);

        doseText.textContent = `${totalDose} mg`;
        dosePerKgText.textContent = `(بر اساس ${finalDosePerKg} mg/kg)`;

        const vialType = parseInt(deferoxamineBrandSelect.value);

        if (vialType === 2000) {
            const num2gVialsFloor = Math.floor(totalDose / 2000);
            const remainder = totalDose % 2000;
            const num500VialsNeeded = Math.ceil(remainder / 500);

            let detailText = '';
            if (remainder > 0 && num500VialsNeeded * 500 >= 2000) {
                const num2gVialsCeil = Math.ceil(totalDose / 2000);
                detailText = `${num2gVialsCeil} ویال ۲ گرم`;
            } else {
                const parts = [];
                if (num2gVialsFloor > 0) parts.push(`${num2gVialsFloor} ویال ۲ گرم`);
                if (num500VialsNeeded > 0) parts.push(`${num500VialsNeeded} ویال ۵۰۰ میلی‌گرم`);
                if (parts.length === 0 && totalDose > 0) parts.push('۱ ویال ۵۰۰ میلی‌گرم');
                detailText = parts.join(' + ');
            }
            doseDetails.textContent = `معادل ${detailText || 'دوز بسیار پایین است'}`;
            
            const total500Vials = Math.ceil(totalDose / 500);
            if (total500Vials > 0) {
                suggestionText.innerHTML = `<strong>پیشنهاد جایگزین:</strong> برای سادگی یا دقت بیشتر در دوز، می‌توانید از <strong>${total500Vials} ویال ۵۰۰ میلی‌گرمی</strong> استفاده کنید.`;
                suggestionBox.classList.remove('hidden');
            }

        } else { // 500mg vial is selected
            const numVials = Math.ceil(totalDose / 500);
            doseDetails.textContent = (numVials > 0) ? `معادل ${numVials} ویال ۵۰۰ میلی‌گرم` : `دوز بسیار پایین است`;
        }
        
        addWarning('<strong>روش مصرف:</strong> تزریق زیرپوستی با پمپ، معمولا طی ۸ تا ۱۲ ساعت و ۵ تا ۷ روز در هفته (طبق دستور پزشک).', 'info');
        addWarning('<strong>پایش دوره‌ای:</strong> در درمان طولانی‌مدت، انجام شنوایی‌سنجی و بینایی‌سنجی سالانه توصیه می‌شود.', 'warning');
    };

    /** Deferasirox Calculation */
    const calculateDeferasirox = (weight, ferritin, isTDT) => {
        let dosePerKg = isTDT ? 21 : 7; // Based on FCT (Jadenu)
        
        if (ferritin) {
            if (ferritin > 2500) {
                dosePerKg = isTDT ? 28 : 14;
            }
            if (ferritin < 300) {
                doseText.textContent = "قطع موقت";
                dosePerKgText.textContent = `(فریتین: ${ferritin})`;
                doseDetails.textContent = "سطح فریتین بسیار پایین است";
                addWarning('سطح فریتین زیر 300 است. مصرف دارو باید تا زمان افزایش فریتین، تحت نظر پزشک متوقف شود.', 'danger');
                return;
            }
        }
        
        dosePerKg = Math.min(dosePerKg, 28);
        const totalDose = weight * dosePerKg;
        const result = findTabletCombination(totalDose, [360, 180, 90]);

        doseText.textContent = `${result.totalDose} mg`;
        dosePerKgText.textContent = `(بر اساس ${dosePerKg} mg/kg)`;
        doseDetails.textContent = result.combination;

        addWarning('<strong>نوع قرص:</strong> این محاسبه برای قرص‌های **روکش‌دار** (مثل جیدنیو) است. اگر از قرص **حل‌شونده** (مثل اکسجید و اسورال) استفاده می‌کنید، دوز شما متفاوت است.', 'info');
        addWarning('<strong>پایش دوره‌ای:</strong> در طول درمان، انجام ماهانه آزمایش‌ عملکرد کلیه (کراتینین) و کبد الزامی است.', 'warning');
    };

    /** Deferiprone Calculation */
    const calculateDeferiprone = (weight, ferritin, isTDT) => {
        let dosePerKg = 75;
        
        if (ferritin && ferritin < 500) {
            addWarning('فریتین زیر ۵۰۰: مصرف دفریپرون معمولاً توصیه نمی‌شود. حتما با پزشک خود مشورت کنید.', 'danger');
        }
        
        dosePerKg = Math.min(dosePerKg, 99);
        let totalDose = weight * dosePerKg;
        totalDose = Math.round(totalDose / 250) * 250;
        const numTablets = totalDose / 500;

        doseText.textContent = `${totalDose} mg`;
        dosePerKgText.textContent = `(بر اساس ${dosePerKg} mg/kg)`;
        doseDetails.textContent = `معادل ${numTablets} قرص ۵۰۰ میلی‌گرمی در روز`;
        
        if (numTablets > 0) {
            suggestionText.innerHTML = `<strong>نحوه مصرف:</strong> در ۳ نوبت مساوی در روز (هر ۸ ساعت). مثلاً: ${Math.round(numTablets/3)} قرص صبح، ${Math.floor(numTablets/3)} قرص ظهر و ${Math.floor(numTablets/3)} قرص شب.`;
            suggestionBox.classList.remove('hidden');
        }
        
        addWarning('<strong>هشدار بسیار مهم:</strong> هنگام مصرف دفریپرون، انجام هفتگی آزمایش خون (CBC) برای کنترل گلبول‌های سفید (ریسک نوتروپنی) الزامی است. در صورت بروز علائمی مثل تب یا گلودرد، فوراً مصرف را قطع و به پزشک مراجعه کنید.', 'danger');
    };

    /** Helper to find best tablet combination for Deferasirox */
    const findTabletCombination = (targetDose, availableTablets) => {
        const roundedDose = Math.round(targetDose / 90) * 90;
        let remainingDose = roundedDose;
        const combination = [];
        availableTablets.forEach(tabletSize => {
            const count = Math.floor(remainingDose / tabletSize);
            if (count > 0) {
                combination.push(`${count} عدد قرص ${tabletSize}mg`);
                remainingDose -= count * tabletSize;
            }
        });
        return { totalDose: roundedDose, combination: combination.join(' + ') || 'دوز بسیار پایین است' };
    };
    
    /** Helper to add warning/info messages */
    const addWarning = (message, type = 'warning') => {
        const p = document.createElement('p');
        p.className = type;
        p.innerHTML = message;
        warningMessages.appendChild(p);
    };

    // --- Event Listeners ---
    [weightInput, ferritinInput, tdtRadio, document.getElementById('ntdt'), deferoxamineBrandSelect].forEach(el => {
        el.addEventListener('input', calculateAndDisplay);
    });

    drugTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            currentDrug = tab.dataset.drug;
            drugTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            deferoxamineBrandGroup.style.display = (currentDrug === 'deferoxamine') ? 'block' : 'none';
            calculateAndDisplay();
        });
    });

    darkModeToggle.addEventListener('change', toggleTheme);

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
                console.log('ServiceWorker registration failed: ', err);
            });
        });
    }

    // --- Initial Setup ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    showRandomQuote();
    tdtRadio.checked = true;
    deferoxamineBrandGroup.style.display = 'block';
    calculateAndDisplay();
});
// یک تابع جدید در js/main.js
function calculateCombinationTherapy(weight, ferritin) {
    const selectedDrugs = Array.from(document.querySelectorAll('input[name="combo_drug"]:checked')).map(el => el.value);

    // هوشمندترین و رایج‌ترین حالت: دفروکسامین + دفراسیروکس
    if (selectedDrugs.includes('deferoxamine') && selectedDrugs.includes('deferasirox')) {
        
        // یک پروتکل رایج به عنوان "نقطه شروع پیشنهادی"
        const deferoxamineDose = Math.round(weight * 40);
        const deferasiroxDose = Math.round(weight * 21);

        // بازطراحی کامل بخش نتیجه
        doseText.textContent = "پروتکل ترکیبی پیشنهادی";
        dosePerKgText.textContent = `(برای فریتین بالا و مقاوم به درمان)`;
        doseDetails.innerHTML = `
            <div class="combo-result">
                <span><strong>دفروکسامین:</strong> ${deferoxamineDose} میلی‌گرم</span>
                <span class="combo-days">۲ تا ۳ روز در هفته</span>
            </div>
            <div class="combo-result">
                <span><strong>دفراسیروکس:</strong> ${deferasiroxDose} میلی‌گرم</span>
                <span class="combo-days">در روزهای دیگر (۴ تا ۵ روز در هفته)</span>
            </div>
        `;
        
        addWarning('<strong>خطر بسیار مهم:</strong> درمان ترکیبی ریسک عوارض کلیوی و کبدی را افزایش می‌دهد و **فقط و فقط** باید تحت نظارت دقیق پزشک متخصص انجام شود. این بخش صرفاً جهت آشنایی است.', 'danger');
    } else {
        doseText.textContent = "پروتکل نامشخص";
        dosePerKgText.textContent = "";
        doseDetails.textContent = "لطفاً دو داروی مورد نظر خود را برای درمان ترکیبی انتخاب کنید (رایج‌ترین ترکیب: دفروکسامین + دفراسیروکس).";
    }
}
