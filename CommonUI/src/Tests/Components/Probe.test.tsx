import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProbeElement from '../../Components/Probe/Probe';
import Probe from 'Model/Models/Probe';
import ObjectID from 'Common/Types/ObjectID';

describe('ProbeElement Component', () => {
    const mockProbe: Probe = new Probe();
    mockProbe.name = 'Test Probe';
    mockProbe.iconFileId = new ObjectID('12345');

    test('should display the probe name', () => {
        render(<ProbeElement probe={mockProbe} />);
        const probeName: HTMLElement = screen.getByText('Test Probe');
        expect(probeName).toBeInTheDocument();
    });

    test('should display the image when iconFileId is present', () => {
        render(<ProbeElement probe={mockProbe} />);
        const imageElement: HTMLImageElement | null =
            document.querySelector('img');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('alt', 'Test Probe');
    });

    test('should display the default icon when iconFileId is not present', () => {
        const probeWithoutIcon: Probe = new Probe();
        probeWithoutIcon.name = 'Test Probe';

        render(<ProbeElement probe={probeWithoutIcon} />);
        const iconElement: Element | null =
            document.querySelector('.text-gray-400');
        expect(iconElement).toBeInTheDocument();
    });

    test('should display "No probe found" when no probe is provided', () => {
        render(<ProbeElement probe={null} />);
        const noProbeText: HTMLElement = screen.getByText('No probe found.');
        expect(noProbeText).toBeInTheDocument();
    });

    test('should display the image with correct src when iconFileId is present', () => {
        const probeWithIcon: Probe = new Probe();
        probeWithIcon.iconFileId = new ObjectID('icon123');
        probeWithIcon.name = 'Probe with Icon';

        render(<ProbeElement probe={probeWithIcon} />);
        const imageElement: HTMLElement =
            screen.getByAltText('Probe with Icon');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute(
            'src',
            expect.stringContaining('icon123')
        );
    });

    test('should display the default icon when iconFileId is not present', () => {
        const probeWithoutIcon: Probe = new Probe();
        probeWithoutIcon.name = 'Probe without Icon';

        render(<ProbeElement probe={probeWithoutIcon} />);
        const iconElement: Element | null =
            document.querySelector('.text-gray-400');
        expect(iconElement).toBeInTheDocument();
    });
});
