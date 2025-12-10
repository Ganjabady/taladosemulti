document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const weightInput = document.getElementById('weight');
    const ferritinInput = document.getElementById('ferritin');
    const drugTabs = document.querySelectorAll('.tab-button');
    const deferoxamineBrandGroup = document.getElementById('deferoxamine-brand-group');
    const deferoxamineBrandSelect = document.getElementById('deferoxamine-brand');
    const deferasiroxTypeGroup = document.getElementById('deferasirox-type-group');
    const deferasiroxTypeSelect = document.getElementById('deferasirox-type');
    const ferritinFeedback = document.getElementById('ferritin-feedback');

    const resultSection = document.getElementById('result-section');
    const resultMainTitle = document.getElementById('result-main-title');
    const doseText = document.getElementById('dose-text');
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

    let currentDrug = 'deferoxamine';
    let isComboMode = false;
    const motivationalQuotes = ["تو قوی‌تر از چیزی هستی که فکر می‌کنی.", "هر روز یک قدم، حتی کوچک، به سمت سلامتی بردار.", "قهرمان واقعی، تویی که با شجاعت زندگی می‌کنی.", "امید، قدرتمندترین داروی جهان است.", "فردای تو، روشن‌تر از امروز خواهد بود.", "لبخند بزن، تو الهام‌بخش دیگران هستی."];

    const applyTheme = (theme) => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); darkModeToggle.checked = theme === 'dark'; };
    const toggleTheme = () => { const newTheme = (localStorage.getItem('theme') || 'light') === 'light' ? 'dark' : 'light'; applyTheme(newTheme); };
    const showRandomQuote = () => { const randomIndex = Math.floor(Math.random() * motivationalQuotes.length); quoteElement.textContent = motivationalQuotes[randomIndex]; };

    const calculateAndDisplay = () => {
        const weight = parseFloat(weightInput.value);
        const ferritin = parseFloat(ferritinInput.value) || 0;

        resultSection.classList.add('hidden');
        ferritinFeedback.classList.add('hidden');
        suggestionBox.classList.add('hidden');
        warningMessages.innerHTML = '';
        ferritinFeedback.innerHTML = '';

        if (!weight || weight <= 0) return;

        if (ferritin > 0) {
            ferritinFeedback.classList.remove('hidden');
            if (ferritin < 1000) { ferritinFeedback.className = 'ferritin-feedback good'; ferritinFeedback.innerHTML = '<strong>عالیه!</strong> سطح فریتین شما در محدوده هدف قرار دارد. به همین مسیر خوب ادامه بده.'; }
            else if (ferritin >= 2500 && ferritin < 4000) { ferritinFeedback.className = 'ferritin-feedback high'; ferritinFeedback.innerHTML = '<strong>توجه:</strong> سطح فریتین شما بالاست. نگران نباشید، با درمان منظم کاهش پیدا می‌کند. حتماً در مورد دوز و برنامه درمانی خود با پزشک‌تان مشورت کنید.'; }
            else if (ferritin >= 4000) { ferritinFeedback.className = 'ferritin-feedback very-high'; ferritinFeedback.innerHTML = '<strong>هشدار جدی:</strong> سطح فریتین شما بسیار بالاست. لطفاً در اسرع وقت با پزشک خود مشورت کنید. ممکن است نیاز به درمان ترکیبی یا اقدامات دیگر داشته باشید.'; }
            else { ferritinFeedback.classList.add('hidden'); }
        }

        resultSection.classList.remove('hidden');

        if (isComboMode) {
            if (ferritin > 0 && ferritin < 2000) {
                addWarning('<strong>توجه:</strong> سطح فریتین شما مطلوب است. درمان ترکیبی معمولا برای فریتین‌های بسیار بالا توصیه می‌شود و برای شما ممکن است ریسک بالایی داشته باشد. <strong>حتماً با پزشک خود مشورت کنید.</strong>', 'warning');
            }
            calculateCombinationTherapy(weight, ferritin);
        } else {
            switch (currentDrug) {
                case 'deferoxamine': calculateDeferoxamine(weight, ferritin); break;
                case 'deferasirox': calculateDeferasirox(weight, ferritin); break;
                case 'deferiprone': calculateDeferiprone(weight, ferritin); break;
            }
        }
    };

    const getDosePerKg = (ferritin, doseMap) => {
        if (ferritin > 2500) return doseMap.high;
        if (ferritin > 0 && ferritin < 1000) return doseMap.low;
        return doseMap.mid;
    };
    
    // --- NEW: Helper function to calculate DFO dose based on common vials (Prioritizing 2000mg) ---
    const getVialText = (totalDose) => {
        if (totalDose <= 0) return 'دوز بسیار پایین است';
        
        const roundedDose = Math.round(totalDose / 500) * 500; // Round to nearest 500mg (half vial)
        
        let rem = roundedDose;
        const num2000mg = Math.floor(rem / 2000);
        rem %= 2000;
        const num500mg = Math.round(rem / 500); // Remaining is rounded to the nearest 500mg

        let detailText = [];
        if (num2000mg > 0) detailText.push(`${num2000mg} ویال ۲ گرم`);
        if (num500mg > 0) detailText.push(`${num500mg} ویال ۵۰۰ میلی‌گرم`);
        
        if (detailText.length === 0 && roundedDose > 0) detailText.push('۱ ویال ۵۰۰ میلی‌گرم'); // Minimum dose
        
        return `معادل ${detailText.join(' + ')}`;
    };

    const calculateDeferoxamine = (weight, ferritin) => {
        let dosePerKg = getDosePerKg(ferritin, { low: 30, mid: 42, high: 55 });
        dosePerKg = Math.min(dosePerKg, 60); // Max Dose Cap
        
        // --- Intelligent Rounding for DFO (Round to nearest 500mg for practicality) ---
        const targetDose = weight * dosePerKg;
        const totalDose = Math.round(targetDose / 500) * 500; 

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} میلی‌گرم`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} میلی‌گرم بر کیلوگرم)</div>`;

        // Brand logic is kept but output is based on standard vial availability (2g and 500mg)
        doseDetails.innerHTML += `<span>${getVialText(totalDose)}</span>`;
        
        addWarning('<strong>پایش لازم:</strong> شنوایی‌سنجی و بینایی‌سنجی سالانه', 'info');
    };

    const calculateDeferasirox = (weight, ferritin) => {
        if (ferritin > 0 && ferritin < 300) { resultMainTitle.textContent = 'دوز پیشنهادی روزانه'; doseText.textContent = "قطع موقت"; doseDetails.innerHTML = `<div class="dose-per-kg-text">(فریتین: ${ferritin})</div><span>سطح فریتین بسیار پایین است</span>`; addWarning('سطح فریتین زیر 300 است. مصرف دارو باید متوقف شود.', 'danger'); return; }

        const dfxType = deferasiroxTypeSelect.value;
        let dosePerKg, maxDose, tabletSizes, doseUnit;

        if (dfxType === 'jadenu') { // NEW FORMULATION (360, 180, 90)
            dosePerKg = getDosePerKg(ferritin, { low: 10, mid: 14, high: 24 });
            maxDose = 28;
            tabletSizes = [360, 180, 90];
            doseUnit = 90; // Smallest common dose size
        } else { // EXJADE (500, 250, 125)
            dosePerKg = getDosePerKg(ferritin, { low: 15, mid: 20, high: 35 });
            maxDose = 40;
            tabletSizes = [500, 250, 125];
            doseUnit = 125; // Smallest common dose size
        }

        dosePerKg = Math.min(dosePerKg, maxDose);
        // --- Intelligent Rounding for DFX (Round to nearest dose unit) ---
        const { totalDose, combination } = findTabletCombination(weight * dosePerKg, tabletSizes, doseUnit);

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} میلی‌گرم`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} میلی‌گرم بر کیلوگرم)</div><span>${combination}</span>`;
        addWarning('<strong>پایش لازم:</strong> آزمایش ماهانه عملکرد کلیه (کراتینین) و کبد', 'warning');
    };

    const calculateDeferiprone = (weight, ferritin) => {
        if (ferritin > 0 && ferritin < 500) addWarning('فریتین زیر ۵۰۰: مصرف دفریپرون معمولاً توصیه نمی‌شود. حتما با پزشک خود مشورت کنید.', 'danger');

        let dosePerKg = getDosePerKg(ferritin, { low: 65, mid: 80, high: 95 });
        dosePerKg = Math.min(dosePerKg, 99);
        const totalDosePerDay = weight * dosePerKg;
        
        // --- Intelligent Rounding for DFP (Round to nearest WHOLE tablet of 500mg) ---
        const numTablets = Math.round(totalDosePerDay / 500); 
        const finalTotalDose = numTablets * 500;

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${finalTotalDose} میلی‌گرم`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} میلی‌گرم بر کیلوگرم)</div><span>معادل ${numTablets} قرص ۵۰۰ میلی‌گرمی در روز</span>`;
        if (numTablets > 0) { suggestionText.innerHTML = `<strong>نحوه مصرف:</strong> در ۳ نوبت در روز. مثلاً: ${Math.ceil(numTablets / 3)} قرص صبح، ${Math.floor(numTablets / 3)} قرص ظهر و ${Math.floor(numTablets / 3)} قرص شب.`; suggestionBox.classList.remove('hidden'); }
        addWarning('<strong>پایش لازم:</strong> آزمایش هفتگی خون (CBC) برای کنترل گلبول‌های سفید', 'danger');
    };

    const calculateCombinationTherapy = (weight, ferritin) => {
        const selectedDrugs = Array.from(document.querySelectorAll('input[name="combo_drug"]:checked')).map(el => el.value);
        doseText.textContent = ''; doseDetails.innerHTML = '';

        if (selectedDrugs.length < 2) { addWarning('برای محاسبه پروتکل درمان ترکیبی، لطفاً حداقل دو دارو را انتخاب کنید.', 'warning'); return; }

        resultMainTitle.textContent = 'پروتکل ترکیبی پیشنهادی (اولویت با مصرف روزانه)';
        let monitoring = new Set();
        let htmlDetails = '';

        if (selectedDrugs.includes('deferiprone') && selectedDrugs.includes('deferasirox')) {
             // DFP + DFX Combo - Both are daily and primary
             const doseMap = ferritin > 5000 ? { dfp: 90, dfx: 28 } : { dfp: 75, dfx: 24 };
             
             // DFP: Round to nearest 500mg tablet
             const dfpTotal = Math.round((weight * Math.min(doseMap.dfp, 99)) / 500) * 500;
             const dfpTablets = dfpTotal / 500;
             
             // DFX: Round to nearest 90mg (Jadenu) - Use 90 as the common unit
             const dfxResult = findTabletCombination(weight * Math.min(doseMap.dfx, 28), [360, 180, 90], 90);

             htmlDetails += `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز (سه نوبت)</span></div>`
                          + `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfx} mg/kg)</span><span class="combo-days">هر روز (یک نوبت)</span></div>`;
             monitoring.add('CBC هفتگی').add('کراتینین/کبد ماهانه');
             addWarning('<strong>توجه:</strong> این پروتکل فقط خوراکی است. مصرف همزمان دفرازیروکس و دفریپرون باید تحت نظارت دقیق پزشک انجام شود.', 'danger');


        } else if (selectedDrugs.includes('deferiprone') && selectedDrugs.includes('deferoxamine')) {
            // DFP + DFO Combo - DFP is daily base, DFO is intermittent
            const dfoDays = ferritin > 4000 ? 5 : ferritin > 2500 ? 4 : 3; // Days per week for DFO
            const baseDosePerDay = ferritin > 5000 ? 100 : ferritin > 2500 ? 90 : 80; // Total DFP+DFO mg/kg/day equivalent
            
            const dfpKg = Math.min(75, baseDosePerDay - 25); // DFP base dose (max 75 mg/kg)
            const dfoKgEquivalent = baseDosePerDay - dfpKg; // Remaining is DFO
            
            // DFP: Daily dose
            const dfpTotal = Math.round((weight * dfpKg) / 500) * 500;
            const dfpTablets = dfpTotal / 500;
            
            // DFO: Calculate injection dose (DFO dose * Days per week / 7) => DFO dose/day equivalent
            // Injection Dose per Day = (dfoKgEquivalent / dfoDays) * 7 * weight
            const dfoTotalInjectionDose = Math.round((weight * dfoKgEquivalent * 7 / dfoDays) / 500) * 500; // Round to 500mg
            
            htmlDetails += `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${dfpKg} mg/kg)</span><span class="combo-days">هر روز (سه نوبت)</span></div>`
                         + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotalInjectionDose} میلی‌گرم (${getVialText(dfoTotalInjectionDose).replace('معادل ','')})</span><span class="dose-per-kg-text">(دوز تزریق، معادل ${dfoKgEquivalent.toFixed(0)} mg/kg روزانه)</span><span class="combo-days"><strong>${dfoDays} روز در هفته</strong></span></div>`;
            monitoring.add('CBC هفتگی').add('شنوایی/بینایی سالانه');

        } else if (selectedDrugs.includes('deferoxamine') && selectedDrugs.includes('deferasirox')) {
            // DFX + DFO Combo - DFX is daily base, DFO is intermittent or alternate
            const dfoDays = ferritin > 4000 ? 4 : ferritin > 2500 ? 3 : 2; // Days per week for DFO
            const baseDosePerDay = ferritin > 5000 ? 50 : ferritin > 2500 ? 45 : 40; // Total DFX+DFO mg/kg/day equivalent
            
            const dfxKg = Math.min(25, baseDosePerDay - 15); // DFX base dose (max 25 mg/kg)
            const dfoKgEquivalent = baseDosePerDay - dfxKg; // Remaining is DFO
            
            // DFX: Daily dose (Round to nearest 90mg)
            const dfxResult = findTabletCombination(weight * dfxKg, [360, 180, 90], 90);
            
            // DFO: Calculate injection dose
            const dfoTotalInjectionDose = Math.round((weight * dfoKgEquivalent * 7 / dfoDays) / 500) * 500; // Round to 500mg
            
            htmlDetails += `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${dfxKg.toFixed(0)} mg/kg)</span><span class="combo-days"><strong>در روزهای بدون تزریق</strong></span></div>`
                         + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotalInjectionDose} میلی‌گرم (${getVialText(dfoTotalInjectionDose).replace('معادل ','')})</span><span class="dose-per-kg-text">(دوز تزریق، معادل ${dfoKgEquivalent.toFixed(0)} mg/kg روزانه)</span></span><span class="combo-days"><strong>${dfoDays} روز در هفته</strong></span></div>`;
            monitoring.add('کراتینین/کبد ماهانه').add('شنوایی/بینایی سالانه');
            addWarning('<strong>تذکر:</strong> بهتر است دفرازیروکس و دفروکسامین در **روزهای متفاوت** مصرف شوند تا ریسک عوارض کلیوی کاهش یابد.', 'warning');
        
        } else if (selectedDrugs.length === 3) {
            // Triple Therapy (Emergency only)
            const doseMap = ferritin > 5000 ? { dfp: 80, dfx: 20, dfo: 50, dfoDays: 5 } : { dfp: 70, dfx: 15, dfo: 40, dfoDays: 4 };
            
            const dfpTotal = Math.round((weight * Math.min(doseMap.dfp, 99)) / 500) * 500;
            const dfxResult = findTabletCombination(weight * Math.min(doseMap.dfx, 28), [360, 180, 90], 90);
            const dfoTotalInjectionDose = Math.round((weight * doseMap.dfo * 7 / doseMap.dfoDays) / 500) * 500;

            htmlDetails += `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal} میلی‌گرم (${dfpTotal/500} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز (سه نوبت)</span></div>`
                          + `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose} میلی‌گرم (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfx} mg/kg)</span><span class="combo-days">هر روز (یک نوبت)</span></div>`
                          + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotalInjectionDose} میلی‌گرم (${getVialText(dfoTotalInjectionDose).replace('معادل ','')})</span><span class="dose-per-kg-text">(دوز تزریق، معادل ${doseMap.dfo} mg/kg روزانه)</span><span class="combo-days"><strong>${doseMap.dfoDays} روز در هفته</strong></span></div>`;
            addWarning('<strong>🚨 خطر! درمان سه‌دارویی 🚨</strong><br>این پروتکل بسیار پرخطر بوده و فقط در شرایط بحرانی (مثل نارسایی قلبی)، در ICU و با نظارت لحظه‌ای تیم فوق تخصصی استفاده می‌شود.', 'danger');
            monitoring.add('CBC هفتگی').add('کراتینین/کبد ماهانه').add('شنوایی/بینایی سالانه');
        
        } else {
             htmlDetails = `<span>پروتکل ترکیبی برای این دو دارو استاندارد نیست. لطفاً با پزشک متخصص مشورت کنید.</span>`;
        }

        doseDetails.innerHTML = htmlDetails;
        if(selectedDrugs.length === 2 || selectedDrugs.length === 3) addWarning('<strong>خطر:</strong> درمان ترکیبی ریسک عوارض را افزایش می‌دهد و <strong>فقط و فقط</strong> باید تحت نظارت دقیق پزشک متخصص انجام شود.', 'danger');
        if(monitoring.size > 0) addWarning(`<strong>پایش‌های لازم:</strong> ${[...monitoring].join('، ')}`, 'warning');
    };

    // --- UPDATED: findTabletCombination for DFX to prioritize largest tablet size (e.g., 360mg) ---
    const findTabletCombination = (targetDose, tablets, unit) => {
        // Round target dose to the nearest unit (e.g., nearest 90mg for Jadenu)
        const roundedDose = Math.round(targetDose / unit) * unit; 
        let rem = roundedDose; 
        let comb = [];

        // Iterate through tablet sizes from largest to smallest
        tablets.sort((a, b) => b - a).forEach(s => { 
            const count = Math.floor(rem / s); 
            if (count > 0) { 
                comb.push(`${count} عدد قرص <span dir="ltr">${s} میلی‌گرم</span>`); 
                rem -= count * s; 
            } 
        });

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
        deferasiroxTypeGroup.style.display = (currentDrug === 'deferasirox') ? 'block' : 'none';
        calculateAndDisplay();
    }));

    comboCheckboxes.forEach(cb => cb.addEventListener('change', calculateAndDisplay));
    [weightInput, ferritinInput, deferoxamineBrandSelect, deferasiroxTypeSelect].forEach(el => el.addEventListener('input', calculateAndDisplay));
    darkModeToggle.addEventListener('change', toggleTheme);

    // --- PWA Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Assuming sw.js is at the root or relative path is correct
            navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered!'), err => console.log('SW registration failed: ', err));
        });
    }

    // --- Initial Setup ---
    applyTheme(localStorage.getItem('theme') || 'light');
    showRandomQuote();
    calculateAndDisplay();
});
