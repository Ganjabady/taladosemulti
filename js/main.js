document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const weightInput = document.getElementById('weight');
    const ferritinInput = document.getElementById('ferritin');
    const drugTabs = document.querySelectorAll('.tab-button');
    const deferoxamineBrandGroup = document.getElementById('deferoxamine-brand-group');
    const deferoxamineBrandSelect = document.getElementById('deferoxamine-brand');
    const ferritinFeedback = document.getElementById('ferritin-feedback');
    
    const resultSection = document.getElementById('result-section');
    const resultMainTitle = document.getElementById('result-main-title');
    const doseText = document.getElementById('dose-text');
    const dosePerKgText = document.getElementById('dose-per-kg-text');
    const doseDetails = document.getElementById('dose-details');
    const suggestionBox = document.getElementById('suggestion-box');
    const suggestionText = document.getElementById('suggestion-text');
    const warningMessages = document.getElementById('warning-messages');

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const quoteElement = document.getElementById('motivational-quote');

    const treatmentTypeRadios = document.querySelectorAll('input[name="treatment_type"]');
    const monoTherapyControls = document.getElementById('mono-therapy-controls');
    const comboTherapyControls = document.getElementById('combo-therapy-controls');
    const comboCheckboxes = document.querySelectorAll('input[name="combo_drug"]');

    // --- App State ---
    let currentDrug = 'deferoxamine';
    let isComboMode = false;

    // --- Data ---
    const motivationalQuotes = [ "تو قوی‌تر از چیزی هستی که فکر می‌کنی.", "هر روز یک قدم، حتی کوچک، به سمت سلامتی بردار.", "قهرمان واقعی، تویی که با شجاعت زندگی می‌کنی.", "امید، قدرتمندترین داروی جهان است.", "فردای تو، روشن‌تر از امروز خواهد بود.", "لبخند بزن، تو الهام‌بخش دیگران هستی." ];

    // --- Functions ---
    const applyTheme = (theme) => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); darkModeToggle.checked = theme === 'dark'; };
    const toggleTheme = () => { const newTheme = (localStorage.getItem('theme') || 'light') === 'light' ? 'dark' : 'light'; applyTheme(newTheme); };
    const showRandomQuote = () => { const randomIndex = Math.floor(Math.random() * motivationalQuotes.length); quoteElement.textContent = motivationalQuotes[randomIndex]; };
    
    const calculateAndDisplay = () => {
        const weight = parseFloat(weightInput.value);
        const ferritin = parseFloat(ferritinInput.value);

        resultSection.classList.add('hidden');
        ferritinFeedback.classList.add('hidden');
        suggestionBox.classList.add('hidden');
        warningMessages.innerHTML = '';
        ferritinFeedback.innerHTML = '';

        if (!weight || weight <= 0) return;

        if (ferritin) {
            ferritinFeedback.classList.remove('hidden');
            if (ferritin < 1000) { ferritinFeedback.className = 'ferritin-feedback good'; ferritinFeedback.innerHTML = '<strong>عالیه!</strong> سطح فریتین شما در محدوده هدف و ایده‌آل قرار دارد. به همین مسیر خوب ادامه بده.'; } 
            else if (ferritin >= 2500 && ferritin < 4000) { ferritinFeedback.className = 'ferritin-feedback high'; ferritinFeedback.innerHTML = '<strong>توجه:</strong> سطح فریتین شما بالاست. نگران نباشید، با درمان منظم کاهش پیدا می‌کند. حتماً در مورد دوز و برنامه درمانی خود با پزشک‌تان مشورت کنید.'; } 
            else if (ferritin >= 4000) { ferritinFeedback.className = 'ferritin-feedback very-high'; ferritinFeedback.innerHTML = '<strong>هشدار جدی:</strong> سطح فریتین شما بسیار بالاست. لطفاً در اسرع وقت با پزشک خود مشورت کنید. ممکن است نیاز به درمان ترکیبی یا اقدامات دیگر داشته باشید.'; }
            else { ferritinFeedback.classList.add('hidden'); }
        }
        
        resultSection.classList.remove('hidden');

        if (isComboMode) {
            calculateCombinationTherapy(weight, ferritin);
        } else {
            if (weight < 8 && (currentDrug === 'deferiprone' || currentDrug === 'deferasirox')) addWarning('مصرف این دارو در کودکان با سن یا وزن پایین، باید با احتیاط و حتما تحت نظر پزشک متخصص باشد.', 'warning');
            switch (currentDrug) {
                case 'deferoxamine': calculateDeferoxamine(weight, ferritin); break;
                case 'deferasirox': calculateDeferasirox(weight, ferritin); break;
                case 'deferiprone': calculateDeferiprone(weight, ferritin); break;
            }
        }
    };
    
    const calculateBaseDose = (ferritin, doseMap) => {
        if (ferritin > 2500) return doseMap.high;
        if (ferritin < 1000) return doseMap.low;
        return doseMap.mid;
    };
    
    const getVialText = (totalDose) => {
        const floor2g = Math.floor(totalDose / 2000), remainder = totalDose % 2000, needed500 = Math.ceil(remainder / 500);
        let detailText;
        if (remainder > 0 && needed500 * 500 >= 2000) { detailText = `${Math.ceil(totalDose / 2000)} ویال ۲ گرم`; }
        else { const parts = []; if (floor2g > 0) parts.push(`${floor2g} ویال ۲ گرم`); if (needed500 > 0) parts.push(`${needed500} ویال ۵۰۰ میلی‌گرم`); if (parts.length === 0 && totalDose > 0) parts.push('۱ ویال ۵۰۰ میلی‌گرم'); detailText = parts.join(' + '); }
        return `معادل ${detailText || 'دوز بسیار پایین است'}`;
    };

    const calculateDeferoxamine = (weight, ferritin) => {
        const finalDosePerKg = Math.round(calculateBaseDose(ferritin, { low: 25, mid: 40, high: 50 }));
        const totalDose = Math.round(weight * finalDosePerKg);

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} mg`;
        dosePerKgText.textContent = `(بر اساس ${finalDosePerKg} mg/kg)`;
        doseDetails.innerHTML = '';

        if (deferoxamineBrandSelect.value === '2000') {
             doseDetails.innerHTML = `<span>${getVialText(totalDose)}</span>`;
            const total500Vials = Math.ceil(totalDose / 500);
            if (total500Vials > 0) { suggestionText.innerHTML = `<strong>پیشنهاد جایگزین:</strong> برای سادگی یا دقت بیشتر، می‌توانید از <strong>${total500Vials} ویال ۵۰۰ میلی‌گرمی</strong> استفاده کنید.`; suggestionBox.classList.remove('hidden'); }
        } else {
            const numVials = Math.ceil(totalDose / 500);
            doseDetails.innerHTML = `<span>${(numVials > 0) ? `معادل ${numVials} ویال ۵۰۰ میلی‌گرم` : `دوز بسیار پایین است`}</span>`;
        }
        addWarning('<strong>روش مصرف:</strong> تزریق زیرپوستی با پمپ، معمولا طی ۸ تا ۱۲ ساعت و ۵ تا ۷ روز در هفته (طبق دستور پزشک).', 'info');
        addWarning('<strong>پایش دوره‌ای:</strong> در درمان طولانی‌مدت، انجام شنوایی‌سنجی و بینایی‌سنجی سالانه توصیه می‌شود.', 'warning');
    };

    const calculateDeferasirox = (weight, ferritin) => {
        if (ferritin < 300) { resultMainTitle.textContent = 'دوز پیشنهادی روزانه'; doseText.textContent = "قطع موقت"; dosePerKgText.textContent = `(فریتین: ${ferritin})`; doseDetails.innerHTML = "<span>سطح فریتین بسیار پایین است</span>"; addWarning('سطح فریتین زیر 300 است. مصرف دارو باید تا زمان افزایش فریتین، تحت نظر پزشک متوقف شود.', 'danger'); return; }
        
        const dosePerKg = calculateBaseDose(ferritin, { low: 20, mid: 21, high: 30 });
        const { totalDose, combination } = findTabletCombination(weight * dosePerKg, [360, 180, 90]);
        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} mg`;
        dosePerKgText.textContent = `(بر اساس ${dosePerKg.toFixed(0)} mg/kg)`;
        doseDetails.innerHTML = `<span>${combination}</span>`;
        addWarning('<strong>نوع قرص:</strong> این محاسبه برای قرص‌های **روکش‌دار** (مثل جیدنیو) است. اگر از قرص **حل‌شونده** (مثل اکسجید و اسورال) استفاده می‌کنید، دوز شما متفاوت است.', 'info');
        addWarning('<strong>پایش دوره‌ای:</strong> در طول درمان، انجام ماهانه آزمایش‌ عملکرد کلیه (کراتینین) و کبد الزامی است.', 'warning');
    };

    const calculateDeferiprone = (weight, ferritin) => {
        if (ferritin < 500) addWarning('فریتین زیر ۵۰۰: مصرف دفریپرون معمولاً توصیه نمی‌شود. حتما با پزشک خود مشورت کنید.', 'danger');
        const dosePerKg = calculateBaseDose(ferritin, { low: 75, mid: 75, high: 90 });
        let totalDose = Math.round((weight * dosePerKg) / 250) * 250;
        const numTablets = totalDose / 500;
        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} mg`;
        dosePerKgText.textContent = `(بر اساس ${dosePerKg} mg/kg)`;
        doseDetails.innerHTML = `<span>معادل ${numTablets} قرص ۵۰۰ میلی‌گرمی در روز</span>`;
        if (numTablets > 0) { suggestionText.innerHTML = `<strong>نحوه مصرف:</strong> در ۳ نوبت مساوی در روز (هر ۸ ساعت). مثلاً: ${Math.round(numTablets/3)} قرص صبح، ${Math.floor(numTablets/3)} قرص ظهر و ${Math.floor(numTablets/3)} قرص شب.`; suggestionBox.classList.remove('hidden'); }
        addWarning('<strong>هشدار بسیار مهم:</strong> هنگام مصرف دفریپرون، انجام هفتگی آزمایش خون (CBC) برای کنترل گلبول‌های سفید (ریسک نوتروپنی) الزامی است. در صورت بروز علائمی مثل تب یا گلودرد، فوراً مصرف را قطع و به پزشک مراجعه کنید.', 'danger');
    };
    
    const calculateCombinationTherapy = (weight, ferritin) => {
        const selectedDrugs = Array.from(document.querySelectorAll('input[name="combo_drug"]:checked')).map(el => el.value);
        doseText.textContent = ''; dosePerKgText.textContent = ''; doseDetails.innerHTML = '';
        
        if (selectedDrugs.length !== 2) {
             addWarning('برای محاسبه پروتکل درمان ترکیبی، لطفاً دقیقاً دو دارو را انتخاب کنید.', 'warning');
             return;
        }

        resultMainTitle.textContent = 'پروتکل ترکیبی پیشنهادی';
        
        if (selectedDrugs.includes('deferoxamine') && selectedDrugs.includes('deferiprone')) {
            const dfoDosePerKg = 45, dfpDosePerKg = 85;
            const dfoTotal = Math.round(weight * dfoDosePerKg);
            const dfpTotal = Math.round((weight * dfpDosePerKg) / 250) * 250;
            const dfpTablets = dfpTotal/500;

            doseDetails.innerHTML = `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotal} میلی‌گرم (${getVialText(dfoTotal).replace('معادل ','')})</span><span class="combo-days">۲ تا ۳ روز در هفته</span></div><div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTablets} قرص روزانه)</span><span class="combo-days">هر روز</span></div>`;
        } else if (selectedDrugs.includes('deferoxamine') && selectedDrugs.includes('deferasirox')) {
            const dfoDosePerKg = 40, dfxDosePerKg = 25;
            const dfoTotal = Math.round(weight * dfoDosePerKg);
            const dfxResult = findTabletCombination(weight * dfxDosePerKg, [360, 180, 90]);

            doseDetails.innerHTML = `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotal} میلی‌گرم (${getVialText(dfoTotal).replace('معادل ','')})</span><span class="combo-days">۲ تا ۳ روز در هفته</span></div><div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="combo-days">در روزهای دیگر</span></div>`;
        } else {
             doseDetails.innerHTML = `<span>پروتکل ترکیبی برای این دو دارو کمتر رایج است. لطفاً با پزشک متخصص مشورت کنید.</span>`;
        }
        addWarning('<strong>خطر بسیار مهم:</strong> درمان ترکیبی ریسک عوارض را افزایش می‌دهد و <strong>فقط و فقط</strong> باید تحت نظارت دقیق پزشک متخصص انجام شود. این بخش صرفاً جهت آشنایی است.', 'danger');
    };

    const findTabletCombination = (targetDose, tablets) => {
        const roundedDose = Math.round(targetDose / 90) * 90; let rem = roundedDose, comb = [];
        tablets.forEach(s => { const c = Math.floor(rem / s); if (c > 0) { comb.push(`${c} عدد قرص ${s}mg`); rem -= c * s; } });
        return { totalDose: roundedDose, combination: comb.join(' + ') || 'دوز بسیار پایین است' };
    };
    
    const addWarning = (message, type) => { const p = document.createElement('p'); p.className = type; p.innerHTML = message; warningMessages.appendChild(p); };

    // --- Event Listeners ---
    treatmentTypeRadios.forEach(radio => radio.addEventListener('change', (e) => {
        isComboMode = e.target.value === 'combo';
        monoTherapyControls.classList.toggle('hidden', isComboMode);
        comboTherapyControls.classList.toggle('hidden', !isComboMode);
        calculateAndDisplay();
    }));

    drugTabs.forEach(tab => tab.addEventListener('click', () => {
        currentDrug = tab.dataset.drug;
        drugTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        deferoxamineBrandGroup.style.display = (currentDrug === 'deferoxamine') ? 'block' : 'none';
        calculateAndDisplay();
    }));
    
    comboCheckboxes.forEach(cb => cb.addEventListener('change', calculateAndDisplay));
    [weightInput, ferritinInput, deferoxamineBrandSelect].forEach(el => el.addEventListener('input', calculateAndDisplay));
    darkModeToggle.addEventListener('change', toggleTheme);

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered!'), err => console.log('SW registration failed: ', err));
        });
    }

    // --- Initial Setup ---
    applyTheme(localStorage.getItem('theme') || 'light');
    showRandomQuote();
    calculateAndDisplay();
});
