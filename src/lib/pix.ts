/**
 * Generates a PIX EMV QR Code payload (BR Code) for static PIX.
 * Reference: https://www.bcb.gov.br/content/estabilidadefinanceira/forumpiram/EMV-QRCode-Especificacao-BRCode.pdf
 */

function crc16(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
    crc &= 0xFFFF;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

interface PixPayload {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  description?: string;
  txId?: string;
}

export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity,
  amount,
  description,
  txId = "***",
}: PixPayload): string {
  // Payload Format Indicator
  let payload = tlv("00", "01");

  // Merchant Account Information (GUI + key)
  const gui = tlv("00", "br.gov.bcb.pix");
  const key = tlv("01", pixKey);
  const desc = description ? tlv("02", description) : "";
  payload += tlv("26", gui + key + desc);

  // Merchant Category Code
  payload += tlv("52", "0000");

  // Transaction Currency (986 = BRL)
  payload += tlv("53", "986");

  // Transaction Amount
  payload += tlv("54", amount.toFixed(2));

  // Country Code
  payload += tlv("58", "BR");

  // Merchant Name (max 25 chars)
  payload += tlv("59", merchantName.slice(0, 25));

  // Merchant City (max 15 chars)
  payload += tlv("60", merchantCity.slice(0, 15));

  // Additional Data Field (txId)
  payload += tlv("62", tlv("05", txId));

  // CRC placeholder
  payload += "6304";

  // Calculate CRC16
  const crc = crc16(payload);
  payload += crc;

  return payload;
}
