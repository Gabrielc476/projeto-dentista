'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { FileText, Image, Loader2, X, Download } from 'lucide-react';
import { ClinicRental } from '@/types';
import { AvailabilityGrid, getWeeksData } from './AvailabilityGrid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { clinicRentalService } from '@/features/clinic-rentals/services/clinic-rental.service';

interface AvailabilityExportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function formatDateForApi(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function AvailabilityExportModal({ open, onOpenChange }: AvailabilityExportModalProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [exporting, setExporting] = useState<'pdf' | 'image' | null>(null);
    const [fetchedRentals, setFetchedRentals] = useState<ClinicRental[]>([]);
    const [loadingRentals, setLoadingRentals] = useState(false);

    // Stabilize weeks data with useMemo to ensure referential equality across renders
    const { currentWeek, nextWeek } = useMemo(() => getWeeksData(), []);

    // Fetch rentals for both weeks when modal opens
    useEffect(() => {
        if (open) {
            const fetchRentals = async () => {
                setLoadingRentals(true);
                try {
                    const startDate = formatDateForApi(currentWeek.startDate);
                    const endDate = formatDateForApi(nextWeek.endDate);

                    const data = await clinicRentalService.getAll(startDate, endDate);
                    setFetchedRentals(data);
                } catch (error) {
                    console.error('[Export] Erro ao buscar locações:', error);
                } finally {
                    setLoadingRentals(false);
                }
            };

            fetchRentals();
        }
    }, [open, currentWeek.startDate, nextWeek.endDate]);

    const handleExportPDF = async () => {
        if (!gridRef.current) return;

        setExporting('pdf');
        try {
            // Use ignoreElements to skip styles/links/scripts and rely on inline styles only
            // This avoids issues with unsupported CSS color functions like 'lab' from Tailwind/Shadcn
            const canvas = await html2canvas(gridRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                ignoreElements: (element) => {
                    const tag = element.tagName.toLowerCase();
                    return tag === 'style' || tag === 'link' || tag === 'script';
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            const fileName = `disponibilidade-locacao-${formatFileDate(new Date())}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Erro ao exportar PDF');
        } finally {
            setExporting(null);
        }
    };

    const handleExportImage = async () => {
        if (!gridRef.current) return;

        setExporting('image');
        try {
            const canvas = await html2canvas(gridRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                ignoreElements: (element) => {
                    const tag = element.tagName.toLowerCase();
                    return tag === 'style' || tag === 'link' || tag === 'script';
                }
            });

            const link = document.createElement('a');
            link.download = `disponibilidade-locacao-${formatFileDate(new Date())}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Erro ao exportar imagem');
        } finally {
            setExporting(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Exportar Disponibilidade
                    </DialogTitle>
                    <DialogDescription>
                        Visualize e exporte a grade de disponibilidade para enviar aos interessados.
                    </DialogDescription>
                </DialogHeader>

                {/* Preview Area - Scrollable */}
                <div className="flex-1 overflow-auto border rounded-lg bg-gray-50 p-4">
                    <div className="flex justify-center">
                        {loadingRentals ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                                <p className="text-muted-foreground">Carregando disponibilidade...</p>
                            </div>
                        ) : (
                            <AvailabilityGrid
                                ref={gridRef}
                                rentals={fetchedRentals}
                                currentWeek={currentWeek}
                                nextWeek={nextWeek}
                            />
                        )}
                    </div>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Fechar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExportImage}
                        disabled={exporting !== null}
                        className="gap-2"
                    >
                        {exporting === 'image' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Image className="h-4 w-4" />
                        )}
                        Baixar Imagem
                    </Button>
                    <Button
                        onClick={handleExportPDF}
                        disabled={exporting !== null}
                        className="gap-2"
                    >
                        {exporting === 'pdf' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <FileText className="h-4 w-4" />
                        )}
                        Baixar PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function formatFileDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
