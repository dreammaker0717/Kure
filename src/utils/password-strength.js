// has number
const hasNumber = (number) => new RegExp(/[0-9]/).test(number);

// // has mix of small and capitals
// const hasMixed = (number) => new RegExp(/[a-z]/).test(number) && new RegExp(/[A-Z]/).test(number);
// has lowercase letters
const hasLowercase = (number) => new RegExp(/[a-z]/).test(number);
// has uppercase letters
const hasUppercase = (number) => new RegExp(/[A-Z]/).test(number);

// has special chars
const hasSpecial = (number) => new RegExp(/[!#@$%^&*)(+=._-]/).test(number);

// set color based on password strength
export const strengthColor = (count) => {
    if (count == 0) return { label: 'Weak', color: 'error.main', width: '0%' };
    if (count < 2) return { label: 'Poor', color: 'error.main', width: '20%' };
    if (count < 3) return { label: 'Weak', color: 'warning.main', width: '40%' };
    if (count < 4) return { label: 'Normal', color: 'warning.dark', width: '60%' };
    if (count < 5) return { label: 'Good', color: 'success.main', width: '80%' };
    if (count < 6) return { label: 'Strong', color: 'success.dark', width: '100%' };
    return { label: 'Poor', color: 'error.main', width: '0%' };
};

// password strength indicator
export const strengthIndicator = (number) => {
    let strengths = 0;
    let correct = [];
    if (number.length > 12) {
        strengths += 1;
        correct.push(1);
    }
    if (hasLowercase(number)) {
        strengths += 1;
        correct.push(2);
    }
    if (hasNumber(number)) {
        strengths += 1;
        correct.push(4);
    }
    if (hasSpecial(number)) {
        strengths += 1;
        correct.push(5);
    }
    if (hasUppercase(number)) {
        strengths += 1;
        correct.push(3);
    }
    return { strengths: strengths, correct: correct };
};
