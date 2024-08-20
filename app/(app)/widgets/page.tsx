"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { XIcon } from "lucide-react";
// import { ChromePicker } from "react-color";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  button_bg: z.string(),
  button_color: z.string(),
  button_text: z.string(),
  button_position: z.string(),
  form_bg: z.string(),
  form_color: z.string(),
  form_title: z.string(),
  form_subtitle: z.string(),
  form_rate_text: z.string(),
  form_details_text: z.string(),
  form_button_text: z.string(),
});

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      button_bg: "sdf",
      button_color: "",
      button_text: "",
      button_position: "",
      form_bg: "",
      form_color: "",
      form_title: "",
      form_subtitle: "",
      form_rate_text: "",
      form_details_text: "",
      form_button_text: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    toast.loading("Logging in...");

    // fetch("/api/login", {
    //   method: "POST",
    //   body: JSON.stringify(values),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((res) => res.json())
    //   .then(async (res) => {
    //     toast.dismiss();
    //     if (res.success) {
    //       await signIn("credentials", values);
    //     } else {
    //       toast.error(res.message);
    //     }

    //     setIsSubmitting(false);
    //   })
    //   .catch((err) => {
    //     toast.dismiss();
    //     toast.error(err.message);
    //     setIsSubmitting(false);
    //   });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-xl">Widgets</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="border-b py-3">
                <h2 className="font-bold">Feedback Settings</h2>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="form" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form">Form</TabsTrigger>
                    <TabsTrigger value="button">Button</TabsTrigger>
                  </TabsList>
                  <TabsContent value="form" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="form_bg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="form_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foreground</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="form_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="form_subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtitle</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="form_rate_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rate Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="form_details_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Details Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="form_button_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="button" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="button_bg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Background</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="button_color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foreground</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="button_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="...." disabled={isSubmitting} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="button_position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Position</FormLabel>
                          <FormControl>
                            <Select {...field} disabled={isSubmitting}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Theme" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="right">Right</SelectItem>
                                <SelectItem value="left">Left</SelectItem>
                                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="border-t py-3">
                <Button type="submit" disabled={isSubmitting}>
                  Save
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>

        <Card>
          <CardHeader className="border-b py-3">
            <h2 className="font-bold">Preview</h2>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="relative w-full aspect-square bg-white"
              style={{
                backgroundColor: `#ffffff`,
                backgroundImage: `radial-gradient(#000000 0.5px, #ffffff 0.5px)`,
                backgroundSize: `10px 10px`,
              }}
            >
              <Tabs defaultValue="form" className="w-full flex items-center justify-center pt-4">
                <TabsList>
                  <TabsTrigger value="form">Feedback Form</TabsTrigger>
                  <TabsTrigger value="button">Feedback Button</TabsTrigger>
                </TabsList>
                <TabsContent value="form">
                  <div className="absolute bottom-4 right-4 max-w-xs w-full bg-white rounded-xl">
                    <div className={`w-full rounded-xl p-4`} style={{ backgroundColor: form.watch("form_bg") }}>
                      <div className="flex items-start justify-between mb-3" style={{ color: form.watch("form_color") }}>
                        <div>
                          <h6 className="font-bold">{form.watch("form_title")}</h6>
                          <p className="text-sm">{form.watch("form_subtitle")}</p>
                        </div>
                        <button type="button" className="p-1 bg-white/50 rounded-full" style={{ color: form.watch("form_bg") }}>
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="bg-white/90 rounded-lg p-3">
                        <p className="text-sm mb-2">{form.watch("form_rate_text")}</p>
                        <div className="grid grid-cols-5 gap-3">
                          <button
                            type="button"
                            className={`w-full bg-white aspect-square shadow rounded-md border active:scale-95 transition-all hover:border-gray-300`}
                          >
                            1
                          </button>
                          <button
                            type="button"
                            className={`w-full bg-white aspect-square shadow rounded-md border active:scale-95 transition-all hover:border-gray-300`}
                          >
                            2
                          </button>
                          <button
                            type="button"
                            className={`w-full bg-white aspect-square shadow rounded-md border active:scale-95 transition-all hover:border-gray-300`}
                          >
                            3
                          </button>
                          <button
                            type="button"
                            className={`w-full bg-white aspect-square shadow rounded-md border active:scale-95 transition-all hover:border-gray-300`}
                          >
                            4
                          </button>
                          <button
                            type="button"
                            className={`w-full bg-white aspect-square shadow rounded-md border active:scale-95 transition-all hover:border-gray-300`}
                          >
                            5
                          </button>
                        </div>
                        <p className="text-sm mb-2 mt-3">{form.watch("form_details_text")}</p>
                        <textarea
                          className="w-full rounded border p-3 placeholder:text-sm mb-2"
                          rows="6"
                          placeholder="Please let us know what's your feedback"
                        ></textarea>

                        <Button
                          type="button"
                          variant="brand"
                          className="w-full disabled:contrast-75 disabled:cursor-not-allowed"
                          style={{ background: form.watch("form_bg"), color: form.watch("form_color") }}
                        >
                          {form.watch("form_button_text")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="button">
                  <div
                    className={clsx(
                      {
                        "absolute right-0 px-4 py-2 rounded-t-lg -rotate-90 bottom-2/3 origin-bottom-right": form.watch("button_position") === "right",
                      },
                      {
                        "absolute left-0 px-4 py-2 rounded-t-lg rotate-90 bottom-2/3 origin-bottom-left": form.watch("button_position") === "left",
                      },
                      {
                        "absolute right-4 px-4 py-2 rounded-t-lg bottom-0": form.watch("button_position") === "bottom-right",
                      },
                      {
                        "absolute left-4 px-4 py-2 rounded-t-lg bottom-0": form.watch("button_position") === "bottom-left",
                      }
                    )}
                    style={{ background: form.watch("button_bg"), color: form.watch("button_color") }}
                  >
                    {form.watch("button_text")}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
