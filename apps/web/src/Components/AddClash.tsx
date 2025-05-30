"use client";
import { ChangeEvent, FC, FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { ClashFormErrorType, ClashFormType } from "@/lib/types";
import { clearCache } from "@/app/actions/commonActions";
import { Textarea } from "@/Components/ui/textarea";
import { Calendar } from "@/Components/ui/calendar";
import { Button } from "@/Components/ui/button";
import { CLASH_URL } from "@/lib/apiEndPoints";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { CustomUser } from "@/next-auth";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

const AddClash = ({ user }: { user: CustomUser }) => {

    const [open, setOpen] = useState(false);

    const [image, setImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);

    const [date, setDate] = useState<Date | null>();

    const [clashData, setClashData] = useState<ClashFormType>({});

    const [errors, setErrors] = useState<ClashFormErrorType>();

    const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {

        const file = event.target.files?.[0];

        if (file) {

            setImage(file);

        }

    };

    const handleSubmit = async (event: FormEvent) => {

        event.preventDefault();

        try {

            setLoading(true);

            const formData = new FormData();

            formData.append("title", clashData?.title ?? "");

            formData.append("description", clashData?.description ?? "");

            formData.append("expire_at", date?.toISOString() ?? "");

            if (image) formData.append("image", image);

            const { data } = await axios.post(CLASH_URL, formData, {
                headers: {
                    Authorization: user.token
                }
            });

            setLoading(false);

            if (data?.message) {

                setClashData({});

                setDate(null);

                clearCache("dashboard");

                toast.success(data?.message);

                setOpen(false);

            }

        } catch (error) {

            console.log("The error is ", error);

            setLoading(false);

            if (error instanceof AxiosError) {

                if (error.response?.status === 422) {

                    setErrors(error.response?.data?.errors);

                }

            } else {

                toast.error("Something Went Wrong... Please Try Again!");

            }

        }

    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Create Clash
                </Button>
            </DialogTrigger>

            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                className="xl:max-h-[95vh] overflow-y-auto"
            >
                <DialogHeader>
                    <DialogTitle>
                        Create Clash
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="mt-4 space-y-3">
                        <Label htmlFor="Title">
                            Title
                        </Label>

                        <Input
                            onChange={(e) => setClashData({ ...clashData, title: e.target.value })}
                            placeholder="Type Clash Title"
                            value={clashData?.title ?? ""}
                        />

                        <span className="text-red-500">
                            {errors?.title}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        <Label htmlFor="Description">
                            Description
                        </Label>

                        <Textarea
                            onChange={(e) => setClashData({ ...clashData, description: e.target.value })}
                            placeholder="Type clash description"
                            value={clashData?.description ?? ""}
                        />

                        <span className="text-red-500">
                            {errors?.description}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        <Label htmlFor="name">
                            Image
                        </Label>

                        <Input
                            placeholder="Type clash name"
                            onChange={handleImage}
                            type="file"
                        />

                        <span className="text-red-500">
                            {errors?.image}
                        </span>
                    </div>

                    <div className="mt-4 space-y-3">
                        <Label className="block">
                            Choose Expiry date
                        </Label>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className={cn(
                                        "w-full mt-2 justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                    variant={"outline"}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />

                                    {date ? date.toDateString() : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date ?? new Date()}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>

                        <span className="text-red-500">
                            {errors?.expire_at}
                        </span>
                    </div>

                    <div className="mt-4">
                        <Button className="w-full" disabled={loading}>
                            {loading ? "Processing.." : "Submit"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
};

export default AddClash;