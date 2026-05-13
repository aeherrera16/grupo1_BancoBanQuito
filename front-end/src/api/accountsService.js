const API_BASE_URL = 'http://localhost:8080/core/v1/accounts';

export async function getAccountsByCustomerId(customerId) {
  try {
    const response = await fetch(`${API_BASE_URL}/customer/${customerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Core-User-Id': customerId,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching accounts: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAccountsByCustomerId:', error);
    throw error;
  }
}

export async function getAccountByNumber(accountNumber) {
  try {
    const response = await fetch(`${API_BASE_URL}/${accountNumber}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Core-User-Id': '1001',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching account: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in getAccountByNumber:', error);
    throw error;
  }
}
