

export function dspDate(TheDate, delim = "/") {
    let d = TheDate.Time
    if (TheDate.Valid) {
        const v = d.toString().substring(8, 10) + delim + d.toString().substring(5, 7) + delim + d.toString().substring(0, 4)
        // if (delim !== "/") {
            // console.log(v)
        // }
        return v
    } else {
        return ""
    }
}


export function dspTheDate(d, delim = "/") {
        const v = d.toString().substring(8, 10) + delim + d.toString().substring(5, 7) + delim + d.toString().substring(0, 4)
        return v
}

export function dspTime(time) {
    if (typeof time !== 'string' || !time.includes(':')) {
        return time; // Return the input as-is if it's not a valid time string
    }

    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

export function displayMoney(Amount, noFormat = false) {
    let dollarUS = Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "ILS",
    });
    const price = Amount / 100.0;

    if (noFormat) {
        fPrice = dollarUS.format(price)
        fPrice = fPrice.replace("₪", "")
        fPrice = fPrice.replace(",", "")
        return fPrice
    }
    return dollarUS.format(price)
}


export function displayPhone(VendorContacts) {
    let ph = ""
    if (VendorContacts) {
        let i = 0
        while (i < VendorContacts.length) {
            if (VendorContacts[i].ContactType === "טלפון" || VendorContacts[i].ContactType === "טלפון נייד") {
                p = formatPhoneNumber(VendorContacts[i].ContactValue)
                ph += p + " "
            }
            i++;
        }
    }
    return ph
}

export function formatPhoneNumber(phoneNumber) {
    // Remove all non-digit characters from the input string
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Check if the cleaned phone number has 10 digits
    if (cleaned.length === 10) {
        // Format the phone number as (XXX)XXX-XXXX
        return `${cleaned.slice(3, 6)}-${cleaned.slice(6)} (${cleaned.slice(0, 3)})`;
    } else {
        if (cleaned.length === 9) {
            // Format the phone number as (XXX)XXX-XXXX
            return `${cleaned.slice(2, 5)}-${cleaned.slice(5)} (${cleaned.slice(0, 2)})`;
        } else {
            // If the phone number doesn't have 10 digits, return it as is
            return cleaned;
        }
    }
}

