"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Support</CardTitle>
                        <CardDescription>
                            Une question, un problème ? Laisse-nous un message et on te répondra rapidement.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="subject" className="text-sm font-medium">
                                    Objet
                                </label>
                                <Input id="subject" placeholder="Problème technique, idée, suggestion..." required />
                            </div>
                            <div>
                                <label htmlFor="message" className="text-sm font-medium">
                                    Message
                                </label>
                                <Textarea
                                    id="message"
                                    placeholder="Décris ton souci ou ta demande ici..."
                                    rows={6}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Envoyer la demande
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}