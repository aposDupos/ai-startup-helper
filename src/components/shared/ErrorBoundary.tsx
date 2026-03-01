"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { SectionError } from "./SectionError";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    sectionName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Generic React Error Boundary with retry support.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(
            `[ErrorBoundary] ${this.props.sectionName || "Unknown section"}:`,
            error,
            errorInfo.componentStack
        );
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <SectionError
                    sectionName={this.props.sectionName}
                    onRetry={this.handleRetry}
                />
            );
        }

        return this.props.children;
    }
}
