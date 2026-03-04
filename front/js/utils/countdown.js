// utils/countdown.js

export function formatCountdown(date) {
    const now = new Date().getTime();
    const distance = date.getTime() - now;

    if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
    };
}

export function renderCountdown(container, targetDate) {
    const update = () => {
        const time = formatCountdown(targetDate);
        if (container) {
            container.innerHTML = `
                <div class="countdown-item">
                    <div class="countdown-value">${time.days}</div>
                    <div class="countdown-label">Days</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${time.hours}</div>
                    <div class="countdown-label">Hours</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${time.minutes}</div>
                    <div class="countdown-label">Min</div>
                </div>
                <div class="countdown-item">
                    <div class="countdown-value">${time.seconds}</div>
                    <div class="countdown-label">Sec</div>
                </div>
            `;
        }
    };
    update();
    setInterval(update, 1000);
}