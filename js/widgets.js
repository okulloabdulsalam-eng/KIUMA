// Islamic Widgets for KIUMA Website

// ===== Prayer Timetable Widget =====
class PrayerTimetable {
    constructor(containerId, location = { lat: 0.3476, lng: 32.5825 }) { // Default: Kampala coordinates
        this.containerId = containerId;
        this.location = location;
        this.prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        this.customTimes = this.loadCustomTimes();
        // Default delay times (in minutes): Adhan before prayer, Iqaama after adhan
        this.defaultDelays = {
            Fajr: { adhan: 10, iqaama: 5 },
            Dhuhr: { adhan: 10, iqaama: 5 },
            Asr: { adhan: 10, iqaama: 5 },
            Maghrib: { adhan: 5, iqaama: 2 },
            Isha: { adhan: 10, iqaama: 5 }
        };
    }

    loadCustomTimes() {
        try {
            const stored = localStorage.getItem('kiuma_custom_prayer_times');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Error loading custom prayer times:', e);
            return null;
        }
    }

    saveCustomTimes(times) {
        try {
            localStorage.setItem('kiuma_custom_prayer_times', JSON.stringify(times));
            this.customTimes = times;
        } catch (e) {
            console.error('Error saving custom prayer times:', e);
        }
    }

    async init() {
        await this.fetchPrayerTimes();
        this.render();
        // Update daily at midnight
        this.scheduleDailyUpdate();
    }

    async fetchPrayerTimes() {
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        
        // Check if custom times are set for today
        if (this.customTimes && this.customTimes.date === date) {
            this.prayerTimes = this.customTimes.times;
            this.hijriDate = this.customTimes.hijriDate || { readable: 'Calculating...' };
            this.gregorianDate = this.customTimes.gregorianDate || { readable: new Date().toLocaleDateString() };
            // Use custom adhan and iqaama times if available, otherwise calculate
            if (this.customTimes.adhanTimes && this.customTimes.iqaamaTimes) {
                this.adhanTimes = this.customTimes.adhanTimes;
                this.iqaamaTimes = this.customTimes.iqaamaTimes;
            } else {
                this.calculateAdhanAndIqaama();
            }
            return;
        }
        
        // Using Aladhan API (free Islamic prayer times API)
        const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${this.location.lat}&longitude=${this.location.lng}&method=2`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.code === 200) {
                const timings = data.data.timings;
                this.prayerTimes = {
                    Fajr: this.formatTime(timings.Fajr),
                    Dhuhr: this.formatTime(timings.Dhuhr),
                    Asr: this.formatTime(timings.Asr),
                    Maghrib: this.formatTime(timings.Maghrib),
                    Isha: this.formatTime(timings.Isha)
                };
                // Calculate adhan and iqaama times
                this.calculateAdhanAndIqaama();
                this.hijriDate = data.data.date.hijri;
                this.gregorianDate = data.data.date.gregorian;
            } else {
                this.setDefaultTimes();
            }
        } catch (error) {
            console.error('Error fetching prayer times:', error);
            this.setDefaultTimes();
        }
    }

    setDefaultTimes() {
        // Default times for Kampala (can be updated)
        this.prayerTimes = {
            Fajr: '05:30',
            Dhuhr: '12:45',
            Asr: '15:30',
            Maghrib: '18:45',
            Isha: '20:00'
        };
        // Calculate adhan and iqaama times
        this.calculateAdhanAndIqaama();
        this.hijriDate = { readable: 'Calculating...' };
        this.gregorianDate = { readable: new Date().toLocaleDateString() };
    }

    calculateAdhanAndIqaama() {
        // Check if custom adhan and iqaama times are available
        if (this.customTimes?.adhanTimes && this.customTimes?.iqaamaTimes) {
            // Use custom times directly
            this.adhanTimes = this.customTimes.adhanTimes;
            this.iqaamaTimes = this.customTimes.iqaamaTimes;
            return;
        }
        
        // Otherwise, calculate adhan (call to prayer) and iqaama (second call) times
        this.adhanTimes = {};
        this.iqaamaTimes = {};
        
        // Load custom delays if available
        const customDelays = this.customTimes?.delays || this.defaultDelays;
        
        this.prayers.forEach(prayer => {
            const prayerTime = this.prayerTimes[prayer];
            const delays = customDelays[prayer] || this.defaultDelays[prayer];
            
            // Parse prayer time
            const [time, period] = prayerTime.split(' ');
            const [hours, minutes] = time.split(':');
            let hour24 = parseInt(hours);
            let min24 = parseInt(minutes);
            
            // Convert to 24-hour format
            if (period === 'PM' && hour24 !== 12) {
                hour24 += 12;
            } else if (period === 'AM' && hour24 === 12) {
                hour24 = 0;
            }
            
            // Calculate adhan time (before prayer)
            let adhanMin = min24 - delays.adhan;
            let adhanHour = hour24;
            if (adhanMin < 0) {
                adhanMin += 60;
                adhanHour -= 1;
                if (adhanHour < 0) {
                    adhanHour = 23;
                }
            }
            
            // Calculate iqaama time (after adhan, before prayer)
            let iqaamaMin = adhanMin + delays.iqaama;
            let iqaamaHour = adhanHour;
            if (iqaamaMin >= 60) {
                iqaamaMin -= 60;
                iqaamaHour += 1;
                if (iqaamaHour >= 24) {
                    iqaamaHour = 0;
                }
            }
            
            // Format times
            this.adhanTimes[prayer] = this.formatTime24to12(`${adhanHour.toString().padStart(2, '0')}:${adhanMin.toString().padStart(2, '0')}`);
            this.iqaamaTimes[prayer] = this.formatTime24to12(`${iqaamaHour.toString().padStart(2, '0')}:${iqaamaMin.toString().padStart(2, '0')}`);
        });
    }

    formatTime24to12(time24h) {
        const [hours, minutes] = time24h.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    formatTime(time) {
        // Convert 24-hour to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    getNextPrayer() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        
        for (let prayer of prayerOrder) {
            // Check adhan time first
            if (this.adhanTimes?.[prayer]) {
                const [adhanTime, adhanPeriod] = this.adhanTimes[prayer].split(' ');
                const [adhanHours, adhanMinutes] = adhanTime.split(':');
                let adhanMinutesTotal = parseInt(adhanHours) * 60 + parseInt(adhanMinutes);
                
                if (adhanPeriod === 'PM' && parseInt(adhanHours) !== 12) {
                    adhanMinutesTotal += 12 * 60;
                } else if (adhanPeriod === 'AM' && parseInt(adhanHours) === 12) {
                    adhanMinutesTotal -= 12 * 60;
                }
                
                if (adhanMinutesTotal > currentTime) {
                    return { name: prayer, time: this.adhanTimes[prayer], type: 'Adhan' };
                }
            }
            
            // Check iqaama time
            if (this.iqaamaTimes?.[prayer]) {
                const [iqaamaTime, iqaamaPeriod] = this.iqaamaTimes[prayer].split(' ');
                const [iqaamaHours, iqaamaMinutes] = iqaamaTime.split(':');
                let iqaamaMinutesTotal = parseInt(iqaamaHours) * 60 + parseInt(iqaamaMinutes);
                
                if (iqaamaPeriod === 'PM' && parseInt(iqaamaHours) !== 12) {
                    iqaamaMinutesTotal += 12 * 60;
                } else if (iqaamaPeriod === 'AM' && parseInt(iqaamaHours) === 12) {
                    iqaamaMinutesTotal -= 12 * 60;
                }
                
                if (iqaamaMinutesTotal > currentTime) {
                    return { name: prayer, time: this.iqaamaTimes[prayer], type: 'Iqaama' };
                }
            }
        }
        
        // If no prayer found, next is Fajr tomorrow
        return { name: 'Fajr', time: this.adhanTimes?.['Fajr'] || '--:--', type: 'Adhan' };
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const nextPrayer = this.getNextPrayer();
        
        container.innerHTML = `
            <div class="prayer-widget">
                <div class="prayer-header">
                    <h3>🕌 Prayer Times</h3>
                    <p class="prayer-date">${this.gregorianDate.readable || new Date().toLocaleDateString()}</p>
                </div>
                <div class="next-prayer">
                    <p class="next-prayer-label">Next ${nextPrayer.type || 'Adhan'}</p>
                    <p class="next-prayer-name">${nextPrayer.name}</p>
                    <p class="next-prayer-time">${nextPrayer.time}</p>
                </div>
                <div class="prayer-times-list">
                    ${this.prayers.map(prayer => `
                        <div class="prayer-item ${nextPrayer.name === prayer ? 'active' : ''}">
                            <div class="prayer-name-row">
                                <span class="prayer-name">${prayer}</span>
                            </div>
                            <div class="prayer-times-row">
                                <div class="prayer-time-item">
                                    <span class="time-label">Adhan:</span>
                                    <span class="time-value">${this.adhanTimes?.[prayer] || '--:--'}</span>
                                </div>
                                <div class="prayer-time-item">
                                    <span class="time-label">Iqaama:</span>
                                    <span class="time-value">${this.iqaamaTimes?.[prayer] || '--:--'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    scheduleDailyUpdate() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const msUntilMidnight = tomorrow - now;
        
        setTimeout(() => {
            this.init();
            // Then update every 24 hours
            setInterval(() => this.init(), 24 * 60 * 60 * 1000);
        }, msUntilMidnight);
    }
}

// ===== Hijri Calendar Widget - Updated with Online Islamic Calendar =====
class HijriCalendar {
    constructor(containerId) {
        this.containerId = containerId;
    }

    async init() {
        await this.fetchHijriDate();
        this.render();
        // Update every hour to keep it current
        setInterval(() => {
            this.fetchHijriDate().then(() => this.render());
        }, 60 * 60 * 1000);
    }

    async fetchHijriDate() {
        const today = new Date();
        const date = today.toISOString().split('T')[0];
        
        try {
            // Fetch current Hijri date from Aladhan API (reliable Islamic calendar API)
            const response = await fetch(`https://api.aladhan.com/v1/gToH/${date}?adjustment=0`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.hijri) {
                this.hijriDate = data.data.hijri;
                this.gregorianDate = data.data.gregorian;
                
                // Verify we have valid data
                if (!this.hijriDate.day || !this.hijriDate.month || !this.hijriDate.year) {
                    throw new Error('Invalid Hijri date data received');
                }
            } else {
                throw new Error('Invalid API response');
            }
        } catch (error) {
            console.error('Error fetching Hijri date:', error);
            // Try alternative API endpoint as fallback
            try {
                const fallbackResponse = await fetch(`https://api.aladhan.com/v1/gToHCalendar/${today.getFullYear()}/${today.getMonth() + 1}`);
                const fallbackData = await fallbackResponse.json();
                
                if (fallbackData.code === 200 && fallbackData.data) {
                    // Find today's date in the calendar
                    const todayStr = date;
                    const todayData = fallbackData.data.find(day => day.gregorian.date === todayStr);
                    
                    if (todayData && todayData.hijri) {
                        this.hijriDate = todayData.hijri;
                        this.gregorianDate = todayData.gregorian;
                    } else {
                        this.setDefaultDate();
                    }
                } else {
                    this.setDefaultDate();
                }
            } catch (fallbackError) {
                console.error('Fallback API also failed:', fallbackError);
                this.setDefaultDate();
            }
        }
    }

    setDefaultDate() {
        this.hijriDate = {
            day: '--',
            month: { en: 'Calculating...', ar: '' },
            year: '----'
        };
        this.gregorianDate = {
            date: new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
    }

    getMonthName(month) {
        const months = {
            'Muharram': 'Muharram',
            'Safar': 'Safar',
            'Rabi\' al-awwal': 'Rabi\' al-Awwal',
            'Rabi\' al-thani': 'Rabi\' al-Thani',
            'Jumada al-awwal': 'Jumada al-Awwal',
            'Jumada al-thani': 'Jumada al-Thani',
            'Rajab': 'Rajab',
            'Sha\'ban': 'Sha\'ban',
            'Ramadan': 'Ramadan',
            'Shawwal': 'Shawwal',
            'Dhu al-Qi\'dah': 'Dhu al-Qi\'dah',
            'Dhu al-Hijjah': 'Dhu al-Hijjah'
        };
        return months[month] || month;
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const hijriDay = this.hijriDate.day || '--';
        const hijriMonth = this.getMonthName(this.hijriDate.month?.en || '');
        const hijriYear = this.hijriDate.year || '----';
        const gregorianDate = this.gregorianDate?.date || new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Get Arabic month name if available
        const arabicMonth = this.hijriDate.month?.ar || '';
        const arabicDay = this.hijriDate.weekday?.ar || '';
        
        container.innerHTML = `
            <div class="hijri-widget">
                <div class="hijri-header">
                    <h3>📅 Hijri Calendar</h3>
                </div>
                <div class="hijri-date">
                    <div class="hijri-day">${hijriDay}</div>
                    <div class="hijri-month">${hijriMonth}</div>
                    ${arabicMonth ? `<div class="hijri-month-arabic" style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.25rem;">${arabicMonth}</div>` : ''}
                    <div class="hijri-year">${hijriYear} AH</div>
                </div>
                <div class="gregorian-date">
                    <p style="font-size: 0.9rem; color: var(--text-light); margin-top: 0.5rem;">${gregorianDate}</p>
                </div>
            </div>
        `;
    }
}

// ===== Ramadan Countdown Widget =====
class RamadanCountdown {
    constructor(containerId) {
        this.containerId = containerId;
        this.ramadanDates = this.calculateRamadanDates();
    }

    calculateRamadanDates() {
        const currentYear = new Date().getFullYear();
        const ramadanDates = [];
        
        // Calculate Ramadan dates for current and next year
        for (let year = currentYear; year <= currentYear + 1; year++) {
            // Approximate calculation (actual dates vary by moon sighting)
            // Ramadan typically starts around March-April in Gregorian calendar
            const ramadanStart = new Date(year, 2, 10); // Approximate
            ramadanDates.push(ramadanStart);
        }
        
        return ramadanDates;
    }

    async init() {
        await this.fetchRamadanDate();
        this.startCountdown();
    }

    async fetchRamadanDate() {
        const currentYear = new Date().getFullYear();
        const currentHijriYear = await this.getCurrentHijriYear();
        
        try {
            // Fetch Ramadan (9th month) for current Hijri year
            const response = await fetch(`https://api.aladhan.com/v1/hToGCalendar/${currentHijriYear}/9`);
            const data = await response.json();
            
            if (data.code === 200 && data.data && data.data.length > 0) {
                // Find the first day of Ramadan (1st of month 9)
                const firstDay = data.data.find(day => day.hijri.day === '1' && day.hijri.month.number === 9);
                
                if (firstDay) {
                    const dateStr = firstDay.gregorian.date;
                    const [day, month, year] = dateStr.split('-');
                    this.ramadanStart = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                } else {
                    // If not found, use first entry
                    const dateStr = data.data[0].gregorian.date;
                    const [day, month, year] = dateStr.split('-');
                    this.ramadanStart = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                }
            } else {
                // Try next Hijri year if current year's Ramadan has passed
                const nextHijriYear = currentHijriYear + 1;
                const nextResponse = await fetch(`https://api.aladhan.com/v1/hToGCalendar/${nextHijriYear}/9`);
                const nextData = await nextResponse.json();
                
                if (nextData.code === 200 && nextData.data && nextData.data.length > 0) {
                    const firstDay = nextData.data.find(day => day.hijri.day === '1' && day.hijri.month.number === 9);
                    if (firstDay) {
                        const dateStr = firstDay.gregorian.date;
                        const [day, month, year] = dateStr.split('-');
                        this.ramadanStart = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else {
                        this.setFallbackRamadanDate();
                    }
                } else {
                    this.setFallbackRamadanDate();
                }
            }
        } catch (error) {
            console.error('Error fetching Ramadan date:', error);
            this.setFallbackRamadanDate();
        }
        
        this.startCountdown();
    }

    async getCurrentHijriYear() {
        try {
            const today = new Date();
            const date = today.toISOString().split('T')[0];
            const response = await fetch(`https://api.aladhan.com/v1/gToH/${date}`);
            const data = await response.json();
            
            if (data.code === 200) {
                return parseInt(data.data.hijri.year);
            }
        } catch (e) {
            console.error('Error fetching current Hijri year:', e);
        }
        // Fallback: approximate calculation
        return Math.floor((new Date().getFullYear() - 622) * 1.0307);
    }

    setFallbackRamadanDate() {
        // Fallback to approximate date if API fails
        const currentYear = new Date().getFullYear();
        // Ramadan typically starts around March-April, moving back ~11 days each year
        this.ramadanStart = new Date(currentYear, 2, 10); // March 10 as approximate
    }

    startCountdown() {
        this.updateCountdown();
        setInterval(() => this.updateCountdown(), 1000);
    }

    updateCountdown() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const now = new Date();
        let targetDate = this.ramadanStart;
        
        // If Ramadan has passed this year, get next year's date
        if (targetDate < now) {
            const nextYear = new Date().getFullYear() + 1;
            targetDate = new Date(nextYear, 2, 10);
        }

        const timeDiff = targetDate - now;
        
        if (timeDiff <= 0) {
            container.innerHTML = `
                <div class="ramadan-widget">
                    <div class="ramadan-header">
                        <h3>🌙 Ramadan</h3>
                    </div>
                    <div class="ramadan-status">
                        <p class="ramadan-active">Ramadan Mubarak!</p>
                        <p>May this blessed month bring you peace and blessings.</p>
                    </div>
                </div>
            `;
            return;
        }

        // Check if we're close to Ramadan (within 60 days) - show countdown
        // Otherwise show "Possibly" message
        const daysUntilRamadan = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysUntilRamadan > 60) {
            // Too far away, show "possibly" message
            container.innerHTML = `
                <div class="ramadan-widget">
                    <div class="ramadan-header">
                        <h3>🌙 Ramadan</h3>
                    </div>
                    <div class="ramadan-status">
                        <p class="ramadan-active">Ramadan (Possibly)</p>
                        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Exact dates will be confirmed closer to the time based on moon sighting.</p>
                        <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 0.75rem;">Approximately ${daysUntilRamadan} days away</p>
                    </div>
                </div>
            `;
            return;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        container.innerHTML = `
            <div class="ramadan-widget">
                <div class="ramadan-header">
                    <h3>🌙 Ramadan Countdown</h3>
                </div>
                <div class="ramadan-countdown">
                    <div class="countdown-item">
                        <div class="countdown-number">${days}</div>
                        <div class="countdown-label">Days</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-number">${hours}</div>
                        <div class="countdown-label">Hours</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-number">${minutes}</div>
                        <div class="countdown-label">Minutes</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-number">${seconds}</div>
                        <div class="countdown-label">Seconds</div>
                    </div>
                </div>
                <div class="ramadan-date">
                    <p>Ramadan ${targetDate.getFullYear()}</p>
                </div>
            </div>
        `;
    }
}

// ===== Prayer Times Admin Manager =====
class PrayerTimesAdmin {
    constructor() {
        this.password = 'kiuma2025'; // Admin password - same for all admin features (prayer times, notifications, media)
        this.init();
    }

    init() {
        const adminForm = document.getElementById('prayer-times-admin-form');
        if (!adminForm) return;

        adminForm.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Load current times if available
        this.loadCurrentTimes();
    }

    loadCurrentTimes() {
        const prayerWidget = window.prayerWidgetInstance;
        if (prayerWidget) {
            const adhanTimes = prayerWidget.adhanTimes || {};
            const iqaamaTimes = prayerWidget.iqaamaTimes || {};
            
            // Load Adhan times
            if (adhanTimes.Fajr) {
                document.getElementById('admin-fajr-adhan').value = this.convertTo24Hour(adhanTimes.Fajr);
                document.getElementById('admin-dhuhr-adhan').value = this.convertTo24Hour(adhanTimes.Dhuhr || '');
                document.getElementById('admin-asr-adhan').value = this.convertTo24Hour(adhanTimes.Asr || '');
                document.getElementById('admin-maghrib-adhan').value = this.convertTo24Hour(adhanTimes.Maghrib || '');
                document.getElementById('admin-isha-adhan').value = this.convertTo24Hour(adhanTimes.Isha || '');
            }
            
            // Load Iqaama times
            if (iqaamaTimes.Fajr) {
                document.getElementById('admin-fajr-iqaama').value = this.convertTo24Hour(iqaamaTimes.Fajr);
                document.getElementById('admin-dhuhr-iqaama').value = this.convertTo24Hour(iqaamaTimes.Dhuhr || '');
                document.getElementById('admin-asr-iqaama').value = this.convertTo24Hour(iqaamaTimes.Asr || '');
                document.getElementById('admin-maghrib-iqaama').value = this.convertTo24Hour(iqaamaTimes.Maghrib || '');
                document.getElementById('admin-isha-iqaama').value = this.convertTo24Hour(iqaamaTimes.Isha || '');
            }
        }
    }

    convertTo24Hour(time12h) {
        const [time, period] = time12h.split(' ');
        const [hours, minutes] = time.split(':');
        let hour24 = parseInt(hours);
        
        if (period === 'PM' && hour24 !== 12) {
            hour24 += 12;
        } else if (period === 'AM' && hour24 === 12) {
            hour24 = 0;
        }
        
        return `${hour24.toString().padStart(2, '0')}:${minutes}`;
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const password = document.getElementById('admin-prayer-password').value;
        if (password !== this.password) {
            this.showMessage('Incorrect password!', 'red');
            return;
        }

        // Get Adhan times
        const fajrAdhan = document.getElementById('admin-fajr-adhan').value;
        const dhuhrAdhan = document.getElementById('admin-dhuhr-adhan').value;
        const asrAdhan = document.getElementById('admin-asr-adhan').value;
        const maghribAdhan = document.getElementById('admin-maghrib-adhan').value;
        const ishaAdhan = document.getElementById('admin-isha-adhan').value;

        // Get Iqaama times
        const fajrIqaama = document.getElementById('admin-fajr-iqaama').value;
        const dhuhrIqaama = document.getElementById('admin-dhuhr-iqaama').value;
        const asrIqaama = document.getElementById('admin-asr-iqaama').value;
        const maghribIqaama = document.getElementById('admin-maghrib-iqaama').value;
        const ishaIqaama = document.getElementById('admin-isha-iqaama').value;

        if (!fajrAdhan || !dhuhrAdhan || !asrAdhan || !maghribAdhan || !ishaAdhan) {
            this.showMessage('Please fill in all Adhan times.', 'red');
            return;
        }

        if (!fajrIqaama || !dhuhrIqaama || !asrIqaama || !maghribIqaama || !ishaIqaama) {
            this.showMessage('Please fill in all Iqaama times.', 'red');
            return;
        }

        // Get existing prayer times from widget (keep them unchanged)
        const existingTimes = window.prayerWidgetInstance?.prayerTimes || {};
        
        // Convert to 12-hour format
        const customTimes = {
            date: new Date().toISOString().split('T')[0],
            times: existingTimes, // Keep existing prayer times
            adhanTimes: {
                Fajr: this.formatTime(fajrAdhan),
                Dhuhr: this.formatTime(dhuhrAdhan),
                Asr: this.formatTime(asrAdhan),
                Maghrib: this.formatTime(maghribAdhan),
                Isha: this.formatTime(ishaAdhan)
            },
            iqaamaTimes: {
                Fajr: this.formatTime(fajrIqaama),
                Dhuhr: this.formatTime(dhuhrIqaama),
                Asr: this.formatTime(asrIqaama),
                Maghrib: this.formatTime(maghribIqaama),
                Isha: this.formatTime(ishaIqaama)
            },
            hijriDate: window.prayerWidgetInstance?.hijriDate || {},
            gregorianDate: window.prayerWidgetInstance?.gregorianDate || { readable: new Date().toLocaleDateString() }
        };

        // Save to localStorage
        if (window.prayerWidgetInstance) {
            window.prayerWidgetInstance.saveCustomTimes(customTimes);
            // Keep existing prayer times, only update adhan and iqaama
            window.prayerWidgetInstance.adhanTimes = customTimes.adhanTimes;
            window.prayerWidgetInstance.iqaamaTimes = customTimes.iqaamaTimes;
            window.prayerWidgetInstance.render();
        }

        this.showMessage('Adhan and Iqaama times updated successfully!', 'green');
        document.getElementById('admin-prayer-password').value = '';
    }

    formatTime(time24h) {
        const [hours, minutes] = time24h.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    showMessage(message, color) {
        const messageDiv = document.getElementById('prayer-admin-message');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.style.color = color;
            setTimeout(() => {
                messageDiv.textContent = '';
            }, 5000);
        }
    }
}

// Initialize widgets when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Prayer Timetable if container exists
    const prayerContainer = document.getElementById('prayer-timetable-widget');
    if (prayerContainer) {
        const prayerWidget = new PrayerTimetable('prayer-timetable-widget');
        window.prayerWidgetInstance = prayerWidget; // Store globally for admin access
        prayerWidget.init();
    }

    // Initialize Hijri Calendar if container exists
    const hijriContainer = document.getElementById('hijri-calendar-widget');
    if (hijriContainer) {
        const hijriWidget = new HijriCalendar('hijri-calendar-widget');
        hijriWidget.init();
    }

    // Initialize Ramadan Countdown if container exists
    const ramadanContainer = document.getElementById('ramadan-countdown-widget');
    if (ramadanContainer) {
        const ramadanWidget = new RamadanCountdown('ramadan-countdown-widget');
        ramadanWidget.init();
    }

    // Initialize Prayer Times Admin if form exists
    if (document.getElementById('prayer-times-admin-form')) {
        new PrayerTimesAdmin();
        
        // Show/Hide admin panel
        const showBtn = document.getElementById('show-prayer-admin');
        const hideBtn = document.getElementById('hide-prayer-admin');
        const adminSection = document.getElementById('prayer-admin-section');
        
        if (showBtn && hideBtn && adminSection) {
            showBtn.addEventListener('click', () => {
                adminSection.style.display = 'block';
                showBtn.style.display = 'none';
            });
            
            hideBtn.addEventListener('click', () => {
                adminSection.style.display = 'none';
                showBtn.style.display = 'inline-block';
            });
        }
    }
});

