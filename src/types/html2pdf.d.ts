/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: 'jpeg' | 'png' | 'webp';
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string;
    };
    jsPDF?: {
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | number[];
      orientation?: 'portrait' | 'landscape';
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string[];
      before?: string[];
      after?: string[];
      avoid?: string[];
    };
  }

  interface Html2Pdf {
    set(options: Html2PdfOptions): Html2Pdf;
    from(element: HTMLElement | string): Html2Pdf;
    save(): Promise<void>;
    output(type?: string): Promise<any>;
    outputPdf(type?: string): Promise<any>;
    outputImg(type?: string): Promise<any>;
    then(callback: (pdf: any) => void): Html2Pdf;
    catch(callback: (error: any) => void): Html2Pdf;
  }

  function html2pdf(): Html2Pdf;
  function html2pdf(element: HTMLElement | string, options?: Html2PdfOptions): Html2Pdf;

  export = html2pdf;
}
