import { sendEmail } from './email.service';

/* eslint-disable import/no-extraneous-dependencies */
import { stringify, ColumnOption} from 'csv-stringify';

export const generateCsv = async (
  csvData: object[],
  columns: ColumnOption[],
  requestEmail: string
): Promise<any> => {

  stringify(csvData, { header: true, columns }, async (err: any, output: any): Promise<{ status: number; message?: string }> => {
    const result = { status: 400, message: 'Error generating CSV' };

    if (err) {
      console.error(err);
      return result;
    }

    const emailResponse = await sendEmail(
      requestEmail, 
      'Your Time Records CSV',
      'Attached is the CSV file containing your time records.',
      [
        {
          filename: 'time_records.csv',
          content: output,
        },
      ],
    );

    if (emailResponse.status === 200) {
      result.message = 'CSV emailed successfully';
      result.status = 200;
    }

    return result;

  });
  
};
