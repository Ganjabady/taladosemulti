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
    const motivationalQuotes = [ "تو قوی‌تر از چیزی هستی که فکر می‌کنی.", "هر روز یک قدم، حتی کوچک، به سمت سلامتی بردار.", "قهرمان واقعی، تویی که با شجاعت زندگی می‌کنی.", "امید، قدرتمندترین داروی جهان است.", "فردای تو، روشن‌تر از امروز خواهد بود.", "لبخند بزن، تو الهام‌بخش دیگران هستی." ];

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
            if (ferritin < 1000) { ferritinFeedback.className = 'ferritin-feedback good'; ferritinFeedback.innerHTML = '<strong>عالیه!</strong> سطح فریتین شما در محدوده هدف و ایده‌آل قرار دارد. به همین مسیر خوب ادامه بده.'; } 
            else if (ferritin >= 2500 && ferritin < 4000) { ferritinFeedback.className = 'ferritin-feedback high'; ferritinFeedback.innerHTML = '<strong>توجه:</strong> سطح فریتین شما بالاست. نگران نباشید، با درمان منظم کاهش پیدا می‌کند. حتماً در مورد دوز و برنامه درمانی خود با پزشک‌تان مشورت کنید.'; } 
            else if (ferritin >= 4000) { ferritinFeedback.className = 'ferritin-feedback very-high'; ferritinFeedback.innerHTML = '<strong>هشدار جدی:</strong> سطح فریتین شما بسیار بالاست. لطفاً در اسرع وقت با پزشک خود مشورت کنید. ممکن است نیاز به درمان ترکیبی یا اقدامات دیگر داشته باشید.'; }
            else { ferritinFeedback.classList.add('hidden'); }
        }
        
        resultSection.classList.remove('hidden');

        if (isComboMode) {
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
        const dosePerKg = getDosePerKg(ferritin, { low: 30, mid: 42, high: 55 });
        const totalDose = Math.round(weight * dosePerKg);

        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} mg`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg} mg/kg)</div>`;

        if (deferoxamineBrandSelect.value === '2000') {
             doseDetails.innerHTML += `<span>${getVialText(totalDose)}</span>`;
            const total500Vials = Math.ceil(totalDose / 500);
            if (total500Vials > 0) { suggestionText.innerHTML = `<strong>پیشنهاد جایگزین:</strong> برای سادگی یا دقت بیشتر، می‌توانید از <strong>${total500Vials} ویال ۵۰۰ میلی‌گرمی</strong> استفاده کنید.`; suggestionBox.classList.remove('hidden'); }
        } else {
            const numVials = Math.ceil(totalDose / 500);
            doseDetails.innerHTML += `<span>${(numVials > 0) ? `معادل ${numVials} ویال ۵۰۰ میلی‌گرم` : `دوز بسیار پایین است`}</span>`;
        }
        addWarning('<strong>روش مصرف:</strong> تزریق زیرپوستی با پمپ، معمولا طی ۸ تا ۱۲ ساعت و ۵ تا ۷ روز در هفته (طبق دستور پزشک).', 'info');
        addWarning('<strong>پایش دوره‌ای:</strong> در درمان طولانی‌مدت، انجام شنوایی‌سنجی و بینایی‌سنجی سالانه توصیه می‌شود.', 'warning');
    };

    const calculateDeferasirox = (weight, ferritin) => {
        if (ferritin > 0 && ferritin < 300) { resultMainTitle.textContent = 'دوز پیشنهادی روزانه'; doseText.textContent = "قطع موقت"; doseDetails.innerHTML = `<div class="dose-per-kg-text">(فریتین: ${ferritin})</div><span>سطح فریتین بسیار پایین است</span>`; addWarning('سطح فریتین زیر 300 است. مصرف دارو باید تا زمان افزایش فریتین، تحت نظر پزشک متوقف شود.', 'danger'); return; }
        
        const dosePerKg = getDosePerKg(ferritin, { low: 10, mid: 14, high: 24 }); // Jadenu doses
        const { totalDose, combination } = findTabletCombination(weight * dosePerKg, [360, 180, 90]);
        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} mg`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg.toFixed(0)} mg/kg برای Jadenu)</div><span>${combination}</span>`;
        addWarning('<strong>نوع قرص:</strong> این محاسبه برای قرص‌های **روکش‌دار** (مثل جیدنیو) است. اگر از قرص **حل‌شونده** (مثل اکسجید و اسورال) استفاده می‌کنید، دوز شما متفاوت است.', 'info');
        addWarning('<strong>پایش دوره‌ای:</strong> در طول درمان، انجام ماهانه آزمایش‌ عملکرد کلیه (کراتینین) و کبد الزامی است.', 'warning');
    };

    const calculateDeferiprone = (weight, ferritin) => {
        if (ferritin > 0 && ferritin < 500) addWarning('فریتین زیر ۵۰۰: مصرف دفریپرون معمولاً توصیه نمی‌شود. حتما با پزشک خود مشورت کنید.', 'danger');
        const dosePerKg = getDosePerKg(ferritin, { low: 65, mid: 80, high: 95 });
        let totalDose = Math.round((weight * dosePerKg) / 250) * 250;
        const numTablets = totalDose / 500;
        resultMainTitle.textContent = 'دوز پیشنهادی روزانه';
        doseText.textContent = `${totalDose} mg`;
        doseDetails.innerHTML = `<div class="dose-per-kg-text">(بر اساس ${dosePerKg} mg/kg)</div><span>معادل ${numTablets} قرص ۵۰۰ میلی‌گرمی در روز</span>`;
        if (numTablets > 0) { suggestionText.innerHTML = `<strong>نحوه مصرف:</strong> در ۳ نوبت مساوی در روز (هر ۸ ساعت). مثلاً: ${Math.round(numTablets/3)} قرص صبح، ${Math.floor(numTablets/3)} قرص ظهر و ${Math.floor(numTablets/3)} قرص شب.`; suggestionBox.classList.remove('hidden'); }
        addWarning('<strong>هشدار بسیار مهم:</strong> هنگام مصرف دفریپرون، انجام هفتگی آزمایش خون (CBC) برای کنترل گلبول‌های سفید (ریسک نوتروپنی) الزامی است.', 'danger');
    };
    
    const calculateCombinationTherapy = (weight, ferritin) => {
        const selectedDrugs = Array.from(document.querySelectorAll('input[name="combo_drug"]:checked')).map(el => el.value);
        doseText.textContent = ''; doseDetails.innerHTML = '';
        
        if (selectedDrugs.length < 2) { addWarning('برای محاسبه درمان ترکیبی، لطفاً حداقل دو دارو را انتخاب کنید.', 'warning'); return; }

        resultMainTitle.textContent = 'پروتکل ترکیبی پیشنهادی';
        
        if (selectedDrugs.length === 3) {
            const doseMap = ferritin > 5000 ? { dfp: 90, dfx: 35, dfo: 55, dfoDays: 4 } : { dfp: 80, dfx: 28, dfo: 45, dfoDays: 3 };
            const dfpTotal = Math.round((weight * doseMap.dfp) / 250) * 250, dfpTablets = dfpTotal / 500;
            const dfxResult = findTabletCombination(weight * doseMap.dfx, [360, 180, 90]);
            const dfoTotal = Math.round(weight * doseMap.dfo);
            doseDetails.innerHTML = `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal}mg (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز</span></div>`
                                  + `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose}mg (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfx} mg/kg)</span><span class="combo-days">هر روز</span></div>`
                                  + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotal}mg (${getVialText(dfoTotal).replace('معادل ','')})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfo} mg/kg)</span><span class="combo-days">${doseMap.dfoDays} روز در هفته</span></div>`;
            addWarning('<strong>🚨 خطر! درمان سه‌دارویی 🚨</strong><br>این پروتکل بسیار پرخطر بوده و فقط در شرایط بحرانی (نارسایی قلبی)، در ICU و با نظارت لحظه‌ای تیم فوق تخصصی هماتولوژی/قلب استفاده می‌شود. این بخش صرفاً جهت آگاهی از پیچیدگی درمان است.', 'danger');
        } else if (selectedDrugs.includes('deferoxamine') && selectedDrugs.includes('deferiprone')) {
            const doseMap = ferritin > 2500 ? { dfo: 45, dfp: 85, dfoDays: 3 } : { dfo: 35, dfp: 75, dfoDays: 2 };
            const dfoTotal = Math.round(weight * doseMap.dfo);
            const dfpTotal = Math.round((weight * doseMap.dfp) / 250) * 250, dfpTablets = dfpTotal / 500;
            doseDetails.innerHTML = `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal}mg (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز</span></div>`
                                  + `<div class="combo-result"><span><strong>دفروکسامین:</strong> ${dfoTotal}mg (${getVialText(dfoTotal).replace('معادل ','')})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfo} mg/kg)</span><span class="combo-days">${doseMap.dfoDays} روز در هفته</span></div>`;
        } else if (selectedDrugs.includes('deferasirox') && selectedDrugs.includes('deferiprone')) {
            const doseMap = ferritin > 2500 ? { dfx: 25, dfp: 70 } : { dfx: 20, dfp: 65 };
            const dfxResult = findTabletCombination(weight * doseMap.dfx, [360, 180, 90]);
            const dfpTotal = Math.round((weight * doseMap.dfp) / 250) * 250, dfpTablets = dfpTotal / 500;
            doseDetails.innerHTML = `<div class="combo-result"><span><strong>دفریپرون:</strong> ${dfpTotal}mg (${dfpTablets} قرص)</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfp} mg/kg)</span><span class="combo-days">هر روز</span></div>`
                                  + `<div class="combo-result"><span><strong>دفراسیروکس:</strong> ${dfxResult.totalDose}mg (${dfxResult.combination})</span><span class="dose-per-kg-text">(بر اساس ${doseMap.dfx} mg/kg)</span><span class="combo-days">هر روز</span></div>`;
        } else {
             doseDetails.innerHTML = `<span>پروتکل ترکیبی برای این دو دارو استاندارد نیست. لطفاً با پزشک متخصص مشورت کنید.</span>`;
        }
        if(selectedDrugs.length === 2) addWarning('<strong>خطر:</strong> درمان ترکیبی ریسک عوارض را افزایش می‌دهد و **فقط و فقط** باید تحت نظارت دقیق پزشک متخصص انجام شود. این بخش صرفاً جهت آشنایی است.', 'danger');
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
